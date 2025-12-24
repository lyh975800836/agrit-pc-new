import { shallowMount } from '@vue/test-utils';
import RightRankingPanel from '@/components/Dashboard/RightRankingPanel.vue';
import apiClient from '@/services/apiClient';

jest.mock('@/services/apiClient');

jest.mock('@/utils/imageManager', () => ({
  getCategoryImages: jest.fn(() => ({
    rankingPanelBg: '/test-bg.png'
  }))
}));

describe('RightRankingPanel.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  const createWrapper = (props = {}) => {
    return shallowMount(RightRankingPanel, {
      propsData: {
        regionName: '百色市',
        rankingData: [],
        qualityData: {},
        selectedFarmingItem: null,
        ...props
      },
      stubs: {
        RankingSection: true,
        QualitySection: true,
        FarmingDynamicsSection: true
      }
    });
  };

  describe('Component Initialization', () => {
    it('should render successfully', () => {
      wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    it('should initialize with empty farmingItems array', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.farmingItems).toEqual([]);
    });

    it('should call loadFarmingList on mount', async () => {
      apiClient.getFarmingList = jest.fn().mockResolvedValue({
        code: 0,
        data: { list: [] }
      });

      wrapper = createWrapper();
      await wrapper.vm.$nextTick();

      expect(apiClient.getFarmingList).toHaveBeenCalledWith('standard');
    });
  });

  describe('loadFarmingList()', () => {
    it('should successfully load farming list from API', async () => {
      const mockFarmingData = [
        {
          id: 1,
          name: '春季施肥',
          start_date: '3月01日',
          end_date: '3月31日',
          prescription: '复合肥',
          specification: '施肥规范'
        }
      ];

      apiClient.getFarmingList = jest.fn().mockResolvedValue({
        code: 0,
        data: { list: mockFarmingData }
      });

      wrapper = createWrapper();
      await wrapper.vm.loadFarmingList();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.farmingItems).toHaveLength(1);
      expect(wrapper.vm.farmingItems[0]).toMatchObject({
        id: 1,
        name: '春季施肥',
        startDate: '3月01日',
        endDate: '3月31日'
      });
    });

    it('should handle API error gracefully', async () => {
      apiClient.getFarmingList = jest.fn().mockRejectedValue(new Error('API Error'));

      wrapper = createWrapper();
      await wrapper.vm.loadFarmingList();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.farmingItems).toEqual([]);
    });

    it('should handle null data response', async () => {
      apiClient.getFarmingList = jest.fn().mockResolvedValue({
        code: 0,
        data: null
      });

      wrapper = createWrapper();
      await wrapper.vm.loadFarmingList();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.farmingItems).toEqual([]);
    });
  });

  describe('getFarmingStatus()', () => {
    beforeEach(() => {
      wrapper = createWrapper();
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date(2024, 4, 15));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "current" for ongoing farming activity', () => {
      const status = wrapper.vm.getFarmingStatus('5月01日', '5月31日');
      expect(status).toBe('current');
    });

    it('should return "expected" for future farming activity', () => {
      const status = wrapper.vm.getFarmingStatus('6月01日', '6月30日');
      expect(status).toBe('expected');
    });

    it('should return "completed" for past farming activity', () => {
      const status = wrapper.vm.getFarmingStatus('3月01日', '3月31日');
      expect(status).toBe('completed');
    });
  });

  describe('handleFarmingItemClick()', () => {
    it('should emit farming-item-click event', async () => {
      wrapper = createWrapper();
      const testItem = { id: 1, name: 'Test Farming' };

      await wrapper.vm.handleFarmingItemClick(testItem);

      expect(wrapper.emitted('farming-item-click')).toBeTruthy();
      expect(wrapper.emitted('farming-item-click')[0]).toEqual([testItem]);
    });
  });
});