import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TreeNode from '@/components/tree/TreeNode.vue'
import { NodeType } from '@/types'
import type { NodeTreeDTO } from '@/types'

const mockNode: NodeTreeDTO = {
  id: '1',
  name: 'Documents',
  type: NodeType.FOLDER,
  parentId: null,
  path: '/Documents',
  depth: 0,
  sortOrder: 0,
  children: [
    {
      id: '2',
      name: 'Work',
      type: NodeType.FOLDER,
      parentId: '1',
      path: '/Documents/Work',
      depth: 1,
      sortOrder: 0,
      children: [],
    },
  ],
}

const mockNodeNoChildren: NodeTreeDTO = {
  ...mockNode,
  id: '3',
  name: 'Empty Folder',
  children: [],
}

describe('TreeNode', () => {
  it('should render folder name', () => {
    const wrapper = mount(TreeNode, {
      props: {
        node: mockNode,
        selectedId: null,
        openIds: new Set(),
      },
      global: {
        stubs: { TreeNode: true },
      },
    })

    expect(wrapper.text()).toContain('Documents')
  })

  it('should show chevron when node has children', () => {
    const wrapper = mount(TreeNode, {
      props: {
        node: mockNode,
        selectedId: null,
        openIds: new Set(),
      },
      global: {
        stubs: { TreeNode: true },
      },
    })

    const chevron = wrapper.find('svg')
    expect(chevron.exists()).toBe(true)
  })

  it('should not show children when folder is closed', () => {
    const wrapper = mount(TreeNode, {
      props: {
        node: mockNode,
        selectedId: null,
        openIds: new Set(),
      },
      global: {
        stubs: { TreeNode: true },
      },
    })

    const ul = wrapper.find('ul')
    expect(ul.exists()).toBe(false)
  })

  it('should show children when folder is open', () => {
    const wrapper = mount(TreeNode, {
      props: {
        node: mockNode,
        selectedId: null,
        openIds: new Set(['1']),
      },
      global: {
        stubs: { TreeNode: true },
      },
    })

    const ul = wrapper.find('ul')
    expect(ul.exists()).toBe(true)
  })

  it('should emit select and toggle on click', async () => {
    const wrapper = mount(TreeNode, {
      props: {
        node: mockNode,
        selectedId: null,
        openIds: new Set(),
      },
      global: {
        stubs: { TreeNode: true },
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('toggle')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([mockNode])
    expect(wrapper.emitted('toggle')![0]).toEqual(['1'])
  })

  it('should apply active class when selected', () => {
    const wrapper = mount(TreeNode, {
      props: {
        node: mockNode,
        selectedId: '1',
        openIds: new Set(),
      },
      global: {
        stubs: { TreeNode: true },
      },
    })

    expect(wrapper.find('button').classes()).toContain('bg-explorer-active')
  })

  it('should not show chevron when node has no children', () => {
    const wrapper = mount(TreeNode, {
      props: {
        node: mockNodeNoChildren,
        selectedId: null,
        openIds: new Set(),
      },
      global: {
        stubs: { TreeNode: true },
      },
    })

    const chevronSpan = wrapper.find('span.w-4')
    expect(chevronSpan.find('svg').exists()).toBe(false)
  })
})