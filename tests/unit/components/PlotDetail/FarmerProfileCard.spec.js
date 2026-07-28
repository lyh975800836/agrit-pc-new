import { shallowMount } from '@vue/test-utils';
import FarmerProfileCard from '@/components/PlotDetail/FarmerProfileCard.vue';

describe('FarmerProfileCard.vue', () => {
  let wrapper;

  const defaultProps = {
    farmerName: '张三',
    farmerAge: '45',
    avatarUrl: '/test-avatar.png',
    backgroundImage: '/test-bg.png',
    statusTags: [
      { label: '一般户', cssClass: 'status-general' },
      { label: '已脱贫', cssClass: 'status-poverty' }
    ]
  };

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  const createWrapper = (props = {}) => {
    return shallowMount(FarmerProfileCard, {
      propsData: {
        ...defaultProps,
        ...props
      }
    });
  };

  describe('Component Rendering', () => {
    it('should render successfully', () => {
      wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    it('should display farmer name', () => {
      wrapper = createWrapper({ farmerName: '李四' });
      expect(wrapper.text()).toContain('李四');
    });

    it('should display farmer age', () => {
      wrapper = createWrapper({ farmerAge: '50' });
      expect(wrapper.text()).toContain('50');
    });

    it('should render avatar image with correct src', () => {
      wrapper = createWrapper({ avatarUrl: '/custom-avatar.jpg' });
      const avatar = wrapper.find('.farmer-avatar');
      expect(avatar.attributes('src')).toBe('/custom-avatar.jpg');
    });

    it('should apply background image style', () => {
      wrapper = createWrapper({ backgroundImage: '/custom-bg.png' });
      const profile = wrapper.find('.farmer-profile');
      expect(profile.attributes('style')).toContain('background-image');
    });
  });

  describe('Status Tags', () => {
    it('should render status tags when provided', () => {
      wrapper = createWrapper();
      const tags = wrapper.findAll('.status-tag');
      expect(tags.length).toBe(2);
    });

    it('should apply correct CSS class to status tags', () => {
      wrapper = createWrapper();
      const tags = wrapper.findAll('.status-tag');
      expect(tags.at(0).classes()).toContain('status-general');
      expect(tags.at(1).classes()).toContain('status-poverty');
    });

    it('should display correct label for each tag', () => {
      wrapper = createWrapper();
      const tags = wrapper.findAll('.status-tag');
      expect(tags.at(0).text()).toBe('一般户');
      expect(tags.at(1).text()).toBe('已脱贫');
    });

    it('should not render tags when empty array provided', () => {
      wrapper = createWrapper({ statusTags: [] });
      const tags = wrapper.findAll('.status-tag');
      expect(tags.length).toBe(0);
    });
  });

  describe('Props Validation', () => {
    it('should have required farmerName prop', () => {
      const { farmerName } = FarmerProfileCard.options.props;
      expect(farmerName.type).toBe(String);
      expect(farmerName.required).toBe(true);
    });

    it('should have required farmerAge prop', () => {
      const { farmerAge } = FarmerProfileCard.options.props;
      expect(farmerAge.type).toBe(String);
      expect(farmerAge.required).toBe(true);
    });

    it('should have statusTags with default empty array', () => {
      const { statusTags } = FarmerProfileCard.options.props;
      expect(statusTags.type).toBe(Array);
      expect(statusTags.default()).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long farmer name', () => {
      const longName = '非常非常非常长的农户姓名测试用例';
      wrapper = createWrapper({ farmerName: longName });
      expect(wrapper.text()).toContain(longName);
    });

    it('should handle special characters in name', () => {
      wrapper = createWrapper({ farmerName: '张三&<>"' });
      expect(wrapper.text()).toContain('张三');
    });

    it('should handle empty avatar URL', () => {
      wrapper = createWrapper({ avatarUrl: '' });
      const avatar = wrapper.find('.farmer-avatar');
      expect(avatar.attributes('src')).toBe('');
    });
  });
});