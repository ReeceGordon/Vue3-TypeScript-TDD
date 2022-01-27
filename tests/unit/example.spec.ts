import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import Timeline from '../../src/components/Timeline.vue'
import { today, thisWeek, thisMonth } from '../../src/mocks'

jest.mock('axios', () => ({
  get: (url:string) => {
    return Promise.resolve({
      data: [today, thisWeek, thisMonth]
  })
  }
}))

const mountTimeline = () => {
  return mount({
    components: { Timeline },
    template: `
    <suspense>
      <template #default>
        <timeline />
      </template>
      <template #fallback>
        Loading...
      </template>
    </suspense>
    `
  })
}

describe('Timeline', () => {
  it('renders today post default', async () => {
    const wrapper = mountTimeline()

    // Resolves any external promises
    await flushPromises()

    expect(wrapper.html()).toContain(today.created.format('Do MMM'))
  })
  it('updates when the period is clicked', async () => {
    const wrapper = mountTimeline()
    await flushPromises()

    //Inside the browser there is a special method
    // requestAnimationFrame(() => ...)
    //This is being run in the background at all times automatically updating the interface
    //This is how Vue works as well, this happens about 60 times a second
    //Inside jest we sometimes wait manually as everything may be running synchronously 

    wrapper.get('[data-test="This Week"').trigger('click')

    // Resolves vue internal promises, such as Reactivity system
    await nextTick()
    // It is very common to require a nextTick after a wrapper.get.trigger so trigger actually returns
    // nextTick making the following one liner possible to perform the same:
    // await wrapper.get('[data-test="This Week"').trigger('click')

    expect(wrapper.html()).toContain(today.created.format('Do MMM'))
    expect(wrapper.html()).toContain(thisWeek.created.format('Do MMM'))
  })
  it('updates when the period is clicked', async () => {
    const wrapper = mountTimeline()
    await flushPromises()

    await wrapper.get('[data-test="This Month"]').trigger('click')

    expect(wrapper.html()).toContain(today.created.format('Do MMM'))
    expect(wrapper.html()).toContain(thisWeek.created.format('Do MMM'))
    expect(wrapper.html()).toContain(thisMonth.created.format('Do MMM'))
  })
})