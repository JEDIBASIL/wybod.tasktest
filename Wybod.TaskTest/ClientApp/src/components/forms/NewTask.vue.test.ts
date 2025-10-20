import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import NewTask from '@/components/forms/NewTask.vue';
import {taskApi} from '@/api/task.api';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    currentRoute: { value: { query: {} } }
  }),
  useRoute: () => ({
    query: {}
  })
}));

vi.mock('@/api/task.api');

const createWrapper = () => {
  return mount(NewTask, {
    global: {
      plugins: [createPinia()],
      stubs: {
        teleport: true
      }
    }
  });
};

describe('NewTask Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with title and description inputs', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('input[name="title"]').exists()).toBe(true);
    expect(wrapper.find('textarea[name="description"]').exists()).toBe(true);
  });

  it('renders create and cancel buttons', () => {
    const wrapper = createWrapper();

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  describe('field validation', () => {
    it('shows error for title less than 3 characters', async () => {
      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]');
      await titleInput.setValue('ab');
      await wrapper.vm.$nextTick();

      const errorMsg = wrapper.text();
      expect(errorMsg).toContain('at least 3 characters');
    });

    it('clears title error when valid title entered', async () => {
      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]');
      await titleInput.setValue('ab');
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('at least 3 characters');

      await titleInput.setValue('Valid Title');
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).not.toContain('at least 3 characters');
    });

    it('shows error for description less than 10 characters', async () => {
      const wrapper = createWrapper();

      const descInput = wrapper.find('textarea[name="description"]');
      await descInput.setValue('short');
      await wrapper.vm.$nextTick();

      const errorMsg = wrapper.text();
      expect(errorMsg).toContain('at least 10 characters');
    });

    it('clears description error when valid description entered', async () => {
      const wrapper = createWrapper();

      const descInput = wrapper.find('textarea[name="description"]');
      await descInput.setValue('short');
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('at least 10 characters');

      await descInput.setValue('This is a valid description');
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).not.toContain('at least 10 characters');
    });
  });

  describe('form submission', () => {
    it('does not submit with invalid title', async () => {
      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]');
      const descInput = wrapper.find('textarea[name="description"]');

      await titleInput.setValue('ab');
      await descInput.setValue('This is a valid description');

      const form = wrapper.find('form');
      await form.trigger('submit');
      await flushPromises();

      expect(wrapper.emitted('task-created')).toBeFalsy();
      expect(vi.mocked(taskApi.createTask)).not.toHaveBeenCalled();
    });

    it('does not submit with invalid description', async () => {
      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]');
      const descInput = wrapper.find('textarea[name="description"]');

      await titleInput.setValue('Valid Title');
      await descInput.setValue('short');

      const form = wrapper.find('form');
      await form.trigger('submit');
      await flushPromises();

      expect(wrapper.emitted('task-created')).toBeFalsy();
      expect(vi.mocked(taskApi.createTask)).not.toHaveBeenCalled();
    });

    it('submits form with valid data', async () => {
      vi.mocked(taskApi.createTask).mockResolvedValueOnce({
        id: '1',
        title: 'Valid Title',
        description: 'This is a valid description',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      } as any);

      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]');
      const descInput = wrapper.find('textarea[name="description"]');

      await titleInput.setValue('Valid Title');
      await descInput.setValue('This is a valid description');

      const form = wrapper.find('form');
      await form.trigger('submit');
      await flushPromises();

      expect(vi.mocked(taskApi.createTask)).toHaveBeenCalledWith({
        title: 'Valid Title',
        description: 'This is a valid description'
      });
    });

    it('trims whitespace from form data before submission', async () => {
      vi.mocked(taskApi.createTask).mockResolvedValueOnce({
        id: '1',
        title: 'Valid Title',
        description: 'This is a valid description',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      } as any);

      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]');
      const descInput = wrapper.find('textarea[name="description"]');

      await titleInput.setValue('  Valid Title  ');
      await descInput.setValue('  This is a valid description  ');

      const form = wrapper.find('form');
      await form.trigger('submit');
      await flushPromises();

      expect(vi.mocked(taskApi.createTask)).toHaveBeenCalledWith({
        title: 'Valid Title',
        description: 'This is a valid description'
      });
    });
  });

  describe('form clearing after submission', () => {
    it('clears form fields after successful submission', async () => {
      vi.mocked(taskApi.createTask).mockResolvedValueOnce({
        id: '1',
        title: 'Valid Title',
        description: 'This is a valid description',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      } as any);

      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]') as any;
      const descInput = wrapper.find('textarea[name="description"]') as any;

      await titleInput.setValue('Valid Title');
      await descInput.setValue('This is a valid description');

      const form = wrapper.find('form');
      await form.trigger('submit');
      await flushPromises();

      expect(titleInput.element.value).toBe('');
      expect(descInput.element.value).toBe('');
    });

    it('clears validation errors after successful submission', async () => {
      vi.mocked(taskApi.createTask).mockResolvedValueOnce({
        id: '1',
        title: 'Valid Title',
        description: 'This is a valid description',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      } as any);

      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]');
      const descInput = wrapper.find('textarea[name="description"]');

      await titleInput.setValue('Valid Title');
      await descInput.setValue('This is a valid description');

      const form = wrapper.find('form');
      await form.trigger('submit');
      await flushPromises();

      expect(wrapper.text()).not.toContain('is required');
      expect(wrapper.text()).not.toContain('at least');
    });
  });

  describe('loading state', () => {
    it('disables submit button while submitting', async () => {
      vi.mocked(taskApi.createTask).mockImplementationOnce(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          id: '1',
          title: 'Valid Title',
          description: 'This is a valid description',
          isCompleted: false,
          createdAt: new Date().toISOString(),
          completedAt: null
        } as any;
      });

      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]');
      const descInput = wrapper.find('textarea[name="description"]');

      await titleInput.setValue('Valid Title');
      await descInput.setValue('This is a valid description');

      const buttons = wrapper.findAll('button');
      const submitButton = buttons[buttons.length - 1];

      expect(submitButton.attributes('disabled')).toBeUndefined();

      const form = wrapper.find('form');
      form.trigger('submit');

      await wrapper.vm.$nextTick();

      expect(submitButton.attributes('disabled')).toBeDefined();
    });

    it('shows loading text while submitting', async () => {
      vi.mocked(taskApi.createTask).mockImplementationOnce(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          id: '1',
          title: 'Valid Title',
          description: 'This is a valid description',
          isCompleted: false,
          createdAt: new Date().toISOString(),
          completedAt: null
        } as any;
      });

      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]');
      const descInput = wrapper.find('textarea[name="description"]');

      await titleInput.setValue('Valid Title');
      await descInput.setValue('This is a valid description');

      const form = wrapper.find('form');
      form.trigger('submit');

      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Creating...');
    });

    it('shows create text when not submitting', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Create Task');
    });
  });

  describe('events', () => {
    it('emits task-created event after successful submission', async () => {
      vi.mocked(taskApi.createTask).mockResolvedValueOnce({
        id: '1',
        title: 'Valid Title',
        description: 'This is a valid description',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      } as any);

      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]');
      const descInput = wrapper.find('textarea[name="description"]');

      await titleInput.setValue('Valid Title');
      await descInput.setValue('This is a valid description');

      const form = wrapper.find('form');
      await form.trigger('submit');
      await flushPromises();

      expect(wrapper.emitted('task-created')).toBeTruthy();
      expect(wrapper.emitted('task-created')).toHaveLength(1);
    });

    it('emits task-created event when cancel button clicked', async () => {
      const wrapper = createWrapper();

      const buttons = wrapper.findAll('button');
      const cancelButton = buttons[0];

      await cancelButton.trigger('click');

      expect(wrapper.emitted('task-created')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('does not crash when createTask throws error', async () => {
      vi.mocked(taskApi.createTask).mockRejectedValueOnce(new Error('API Error'));

      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]');
      const descInput = wrapper.find('textarea[name="description"]');

      await titleInput.setValue('Valid Title');
      await descInput.setValue('This is a valid description');

      const form = wrapper.find('form');
      await form.trigger('submit');
      await flushPromises();

      const submitButton = wrapper.findAll('button')[wrapper.findAll('button').length - 1];
      expect(submitButton.attributes('disabled')).toBeUndefined();
    });

    it('keeps form data when submission fails', async () => {
      vi.mocked(taskApi.createTask).mockRejectedValueOnce(new Error('API Error'));

      const wrapper = createWrapper();

      const titleInput = wrapper.find('input[name="title"]') as any;
      const descInput = wrapper.find('textarea[name="description"]') as any;

      await titleInput.setValue('Valid Title');
      await descInput.setValue('This is a valid description');

      const form = wrapper.find('form');
      await form.trigger('submit');
      await flushPromises();

      expect(titleInput.element.value).toBe('Valid Title');
      expect(descInput.element.value).toBe('This is a valid description');
    });
  });
});