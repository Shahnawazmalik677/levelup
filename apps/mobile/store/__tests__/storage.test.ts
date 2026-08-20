import AsyncStorage from '@react-native-async-storage/async-storage';
import { Technique } from '../../types';
import {
  LearningPlanData,
  isPlanComplete,
  upsertLearningPlan,
  removeLearningPlan,
  updateTechnique,
  getLearningPlans,
  getLevelHistory,
  getActivePlanId,
  setActivePlanId,
} from '../storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

let nextId = 0;
const makeTechnique = (overrides: Partial<Technique> = {}): Technique => ({
  id: `technique-${nextId++}`,
  name: 'Test Technique',
  description: '',
  whyItMatters: '',
  order: 1,
  status: 'active',
  progress: 0,
  estimatedTime: '1 hour',
  difficulty: 'easy',
  practiceChecklist: [],
  resources: [],
  ...overrides,
});

const makePlan = (overrides: Partial<LearningPlanData> = {}): LearningPlanData => ({
  id: `plan-${nextId++}`,
  hobby: 'Chess',
  hobbyIcon: '♟️',
  level: 'beginner',
  techniques: [
    makeTechnique({ order: 1, status: 'active' }),
    makeTechnique({ order: 2, status: 'locked' }),
  ],
  createdAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('isPlanComplete', () => {
  it('is true when every technique is completed or skipped', () => {
    const plan = makePlan({
      techniques: [
        makeTechnique({ status: 'completed' }),
        makeTechnique({ status: 'skipped' }),
      ],
    });
    expect(isPlanComplete(plan)).toBe(true);
  });

  it('is false when any technique is still active or locked', () => {
    const plan = makePlan({
      techniques: [
        makeTechnique({ status: 'completed' }),
        makeTechnique({ status: 'active' }),
      ],
    });
    expect(isPlanComplete(plan)).toBe(false);
  });
});

describe('updateTechnique', () => {
  it('unlocks the next technique when the current one is completed', async () => {
    const plan = makePlan({
      techniques: [
        makeTechnique({ id: 't1', order: 1, status: 'active' }),
        makeTechnique({ id: 't2', order: 2, status: 'locked' }),
      ],
    });
    await upsertLearningPlan(plan);

    const updated = await updateTechnique(plan.id, 't1', {
      status: 'completed',
      progress: 100,
    });

    expect(updated?.techniques.find((t) => t.id === 't1')?.status).toBe('completed');
    expect(updated?.techniques.find((t) => t.id === 't2')?.status).toBe('active');
  });

  it('also unlocks the next technique when the current one is skipped', async () => {
    const plan = makePlan({
      techniques: [
        makeTechnique({ id: 't1', order: 1, status: 'active' }),
        makeTechnique({ id: 't2', order: 2, status: 'locked' }),
      ],
    });
    await upsertLearningPlan(plan);

    const updated = await updateTechnique(plan.id, 't1', {
      status: 'skipped',
      progress: 0,
    });

    expect(updated?.techniques.find((t) => t.id === 't2')?.status).toBe('active');
  });
});

describe('upsertLearningPlan', () => {
  it('adds a new hobby alongside existing ones instead of replacing them', async () => {
    const chess = makePlan({ hobby: 'Chess' });
    const guitar = makePlan({ hobby: 'Guitar' });

    await upsertLearningPlan(chess);
    await upsertLearningPlan(guitar);

    const plans = await getLearningPlans();
    expect(plans).toHaveLength(2);
    expect(plans.map((p) => p.hobby)).toEqual(['Chess', 'Guitar']);
  });

  it('replaces the existing plan for the same hobby (case-insensitive) instead of duplicating it', async () => {
    const beginnerChess = makePlan({ id: 'plan-a', hobby: 'Chess', level: 'beginner' });
    await upsertLearningPlan(beginnerChess);

    const intermediateChess = makePlan({
      id: 'plan-b',
      hobby: 'chess',
      level: 'intermediate',
    });
    await upsertLearningPlan(intermediateChess);

    const plans = await getLearningPlans();
    expect(plans).toHaveLength(1);
    expect(plans[0].id).toBe('plan-b');
    expect(plans[0].level).toBe('intermediate');
  });

  it('archives a finished plan to level history when it gets replaced', async () => {
    const finishedChess = makePlan({
      id: 'plan-a',
      hobby: 'Chess',
      level: 'beginner',
      techniques: [makeTechnique({ status: 'completed' }), makeTechnique({ status: 'skipped' })],
    });
    await upsertLearningPlan(finishedChess);
    await upsertLearningPlan(makePlan({ id: 'plan-b', hobby: 'Chess', level: 'intermediate' }));

    const history = await getLevelHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ hobby: 'Chess', level: 'beginner', completed: 1, skipped: 1, total: 2 });
  });

  it('does not archive an unfinished plan when it gets replaced', async () => {
    const unfinishedChess = makePlan({
      id: 'plan-a',
      hobby: 'Chess',
      techniques: [makeTechnique({ status: 'completed' }), makeTechnique({ status: 'locked' })],
    });
    await upsertLearningPlan(unfinishedChess);
    await upsertLearningPlan(makePlan({ id: 'plan-b', hobby: 'Chess' }));

    const history = await getLevelHistory();
    expect(history).toHaveLength(0);
  });
});

describe('active plan tracking', () => {
  it('sets the newly added hobby as active', async () => {
    const chess = makePlan({ id: 'plan-a', hobby: 'Chess' });
    const guitar = makePlan({ id: 'plan-b', hobby: 'Guitar' });
    await upsertLearningPlan(chess);
    await upsertLearningPlan(guitar);

    expect(await getActivePlanId()).toBe('plan-b');
  });

  it('sets a replacement plan as active even when the hobby name matches', async () => {
    await upsertLearningPlan(makePlan({ id: 'plan-a', hobby: 'Chess', level: 'beginner' }));
    await setActivePlanId('plan-a');
    await upsertLearningPlan(makePlan({ id: 'plan-b', hobby: 'Chess', level: 'intermediate' }));

    expect(await getActivePlanId()).toBe('plan-b');
  });

  it('clears the active plan id when the active plan is removed', async () => {
    const chess = makePlan({ id: 'plan-a', hobby: 'Chess' });
    await upsertLearningPlan(chess);

    await removeLearningPlan('plan-a');

    expect(await getActivePlanId()).toBeNull();
  });

  it('leaves the active plan id untouched when a different plan is removed', async () => {
    const chess = makePlan({ id: 'plan-a', hobby: 'Chess' });
    const guitar = makePlan({ id: 'plan-b', hobby: 'Guitar' });
    await upsertLearningPlan(chess);
    await upsertLearningPlan(guitar);

    await removeLearningPlan('plan-a');

    expect(await getActivePlanId()).toBe('plan-b');
  });
});

describe('removeLearningPlan', () => {
  it('removes only the targeted plan, leaving other concurrent hobbies untouched', async () => {
    const chess = makePlan({ id: 'plan-a', hobby: 'Chess' });
    const guitar = makePlan({ id: 'plan-b', hobby: 'Guitar' });
    await upsertLearningPlan(chess);
    await upsertLearningPlan(guitar);

    await removeLearningPlan('plan-a');

    const plans = await getLearningPlans();
    expect(plans).toHaveLength(1);
    expect(plans[0].hobby).toBe('Guitar');
  });

  it('archives the removed plan only if it was finished', async () => {
    const finished = makePlan({
      id: 'plan-a',
      techniques: [makeTechnique({ status: 'completed' })],
    });
    await upsertLearningPlan(finished);
    await removeLearningPlan('plan-a');

    expect(await getLevelHistory()).toHaveLength(1);
  });
});

describe('getLevelHistory', () => {
  it('filters out legacy entries that were recorded before an incomplete technique', async () => {
    await AsyncStorage.setItem(
      'level_history',
      JSON.stringify([
        { hobby: 'Chess', hobbyIcon: '♟️', level: 'beginner', completed: 2, skipped: 0, total: 8, endedAt: new Date().toISOString() },
      ])
    );

    expect(await getLevelHistory()).toHaveLength(0);
  });
});
