import { vi, describe, it, expect, beforeEach } from 'vitest'

import { mount } from '@vue/test-utils'
import DatePick from '../DatePick.vue'

describe('DatePick.vue', () => {
  vi.mock('dayjs', () => {
    const fn = vi.fn(() => ({
      locale: vi.fn().mockReturnThis(),
      utc: vi.fn().mockReturnThis(),
      tz: vi.fn().mockReturnThis(),
      format: vi.fn().mockReturnValue('1'),
      year: vi.fn().mockReturnValue(1),
      month: vi.fn().mockReturnValue(0),
      date: vi.fn().mockReturnValue(1),
      unix: vi.fn().mockReturnValue(1),
      valueOf: vi.fn().mockReturnValue(1),
      toString: vi.fn().mockReturnValue('1'),
    }))
    fn.unix = vi.fn(() => ({
      tz: vi.fn().mockReturnThis(),
      year: vi.fn().mockReturnValue(1),
      month: vi.fn().mockReturnValue(0),
      date: vi.fn().mockReturnValue(1),
    }))
    fn.tz = vi.fn(() => ({
      unix: vi.fn().mockReturnValue(1),
    }))
    fn.extend = vi.fn()
    fn.locale = vi.fn()
    return { default: fn }
  })

  let wrapper
  beforeEach(() => {
    wrapper = mount(DatePick, {
      props: { modelValue: [] },
    })
  })
  it('checks if localDate returns "-" when no timestamp available', () => {
    expect(wrapper.vm.localDate()).toEqual('-')
  })
  it('checks if localDate returns "-" when timestamp and timezone given', async () => {
    await wrapper.setData({ timeZone: 'Europe/Vilnius' })
    expect(wrapper.vm.localDate(1000)).toEqual('1')
  })
  it('checks if calendarView returns week day names and days', () => {
    wrapper.vm.setValue = { year: 1, month: 0, day: 1 }
    expect(wrapper.vm.calendarView).toEqual([
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      [
        {
          month: 11,
          number: 31,
          previous: true,
          year: 0,
        },
        {
          month: 0,
          number: 1,
          year: 1,
        },
        {
          month: 0,
          number: 2,
          year: 1,
        },
        {
          month: 0,
          number: 3,
          year: 1,
        },
        {
          month: 0,
          number: 4,
          year: 1,
        },
        {
          month: 0,
          number: 5,
          year: 1,
        },
        {
          month: 0,
          number: 6,
          year: 1,
        },
      ],
      [
        {
          month: 0,
          number: 7,
          year: 1,
        },
        {
          month: 0,
          number: 8,
          year: 1,
        },
        {
          month: 0,
          number: 9,
          year: 1,
        },
        {
          month: 0,
          number: 10,
          year: 1,
        },
        {
          month: 0,
          number: 11,
          year: 1,
        },
        {
          month: 0,
          number: 12,
          year: 1,
        },
        {
          month: 0,
          number: 13,
          year: 1,
        },
      ],
      [
        {
          month: 0,
          number: 14,
          year: 1,
        },
        {
          month: 0,
          number: 15,
          year: 1,
        },
        {
          month: 0,
          number: 16,
          year: 1,
        },
        {
          month: 0,
          number: 17,
          year: 1,
        },
        {
          month: 0,
          number: 18,
          year: 1,
        },
        {
          month: 0,
          number: 19,
          year: 1,
        },
        {
          month: 0,
          number: 20,
          year: 1,
        },
      ],
      [
        {
          month: 0,
          number: 21,
          year: 1,
        },
        {
          month: 0,
          number: 22,
          year: 1,
        },
        {
          month: 0,
          number: 23,
          year: 1,
        },
        {
          month: 0,
          number: 24,
          year: 1,
        },
        {
          month: 0,
          number: 25,
          year: 1,
        },
        {
          month: 0,
          number: 26,
          year: 1,
        },
        {
          month: 0,
          number: 27,
          year: 1,
        },
      ],
      [
        {
          month: 0,
          number: 28,
          year: 1,
        },
        {
          month: 0,
          number: 29,
          year: 1,
        },
        {
          month: 0,
          number: 30,
          year: 1,
        },
        {
          month: 0,
          number: 31,
          year: 1,
        },
        {
          month: 1,
          next: true,
          number: 1,
          year: 1,
        },
        {
          month: 1,
          next: true,
          number: 2,
          year: 1,
        },
        {
          month: 1,
          next: true,
          number: 3,
          year: 1,
        },
      ],
    ])
  })
  it('checks if defaultPlaceholder returns default value when no prop received', () => {
    expect(wrapper.vm.defaultPlaceholder).toBe('Select a date')
  })
  it('checks if emits "open" when open changes to true', async () => {
    await wrapper.setData({ open: false })
    wrapper.vm.$options.watch.open.call(wrapper.vm, true)
    expect(wrapper.emitted('open')).toBeTruthy()
  })
  it('checks if emits "close" when open changes to false', async () => {
    await wrapper.setData({ open: true })
    wrapper.vm.$options.watch.open.call(wrapper.vm, false)
    expect(wrapper.emitted('close')).toBeTruthy()
  })
  it('checks if calls clearField when modelValue changes to empty array', () => {
    wrapper.vm.clearField = vi.fn()
    wrapper.vm.$options.watch.modelValue.call(wrapper.vm, [])
    expect(wrapper.vm.clearField).toHaveBeenCalledWith(true)
  })
  it('does not call clearField if modelValue is not empty', () => {
    wrapper.vm.clearField = vi.fn()
    wrapper.vm.$options.watch.modelValue.call(wrapper.vm, [1])
    expect(wrapper.vm.clearField).not.toHaveBeenCalled()
  })
  it('checks if handleStart sets drag to true, prevents default, and calls selectDay with day', () => {
    const mockEvent = { preventDefault: vi.fn() }
    const mockDay = { number: 10, month: 5, year: 2024 }
    wrapper.vm.selectDay = vi.fn()

    wrapper.vm.handleStart(mockEvent, mockDay)

    expect(wrapper.vm.drag).toBe(true)
    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(wrapper.vm.selectDay).toHaveBeenCalledWith(mockDay)
  })
  it('checks if handleEnd changes drag value to false', () => {
    wrapper.vm.handleEnd()
    expect(wrapper.vm.drag).toEqual(false)
  })
  it('checks if handle returns early if startVal is empty', () => {
    wrapper.vm.startVal = {}
    const day = { year: 2025, month: 4, number: 12 }
    expect(wrapper.vm.handle(day)).toBeUndefined()
  })
  it('checks if handle returns early if drag is false', () => {
    wrapper.vm.drag = false
    const day = { year: 2025, month: 4, number: 12 }
    expect(wrapper.vm.handle(day)).toBeUndefined()
  })
  it.each([
    ['day is before startVal (same month/year)', { year: 2025, month: 4, number: 5 }],
    ['day is before startVal (month before, same year)', { year: 2025, month: 3, number: 15 }],
    ['day is before startVal (year before)', { year: 2024, month: 11, number: 15 }],
  ])('checks if handle returns early if %s', (text, day) => {
    expect(wrapper.vm.handle(day)).toBeUndefined()
    expect(wrapper.vm.endVal).toEqual({})
  })
  it('checks if handle sets setValue, endVal, and selected if day is after startVal', () => {
    wrapper.vm.startVal = { year: 2025, month: 4, day: 10 }
    wrapper.vm.setValue = { year: 2025, month: 4, day: 10 }
    wrapper.vm.endVal = {}
    wrapper.vm.selected = {}
    wrapper.vm.drag = true
    const day = { year: 2025, month: 4, number: 15 }
    wrapper.vm.dateToUnix = vi.fn(() => ({ value: [123, 456] }))
    wrapper.vm.handle(day)
    expect(wrapper.vm.setValue).toEqual({ day: 15, month: 4, year: 2025 })
    expect(wrapper.vm.endVal).toEqual({ day: 15, month: 4, year: 2025 })
    expect(wrapper.vm.selected).toEqual({ value: [123, 456] })
    expect(wrapper.vm.dateToUnix).toHaveBeenCalledWith(
      { year: 2025, month: 4, day: 10 },
      { day: 15, month: 4, year: 2025 },
    )
  })
  it.each([
    ["returns today's day if setValue.month matches today's month", 'day', 4, 1],
    ["returns null if setValue.month does not match today's month", 'day', 3, null],
    ['returns today\'s month (0-based) for param "month"', 'month', 4, 0],
    ['returns today\'s year for param "year"', 'year', 4, 1],
    ["returns today's year for undefined param", undefined, 4, 1],
  ])('%s', (text, param, setMonth, res) => {
    const today = new Date(1, 4, 1)
    wrapper.vm.today = today
    wrapper.vm.setValue = { year: 1, month: 4, day: 1 }
    wrapper.vm.setValue.month = setMonth
    expect(wrapper.vm.getTodays(param)).toBe(res)
  })
  it.each([
    ['increase', { day: 1, month: 1, year: 2024 }, 1, { day: 1, month: 1, year: 2025 }],
    ['decrease', { day: 1, month: 1, year: 2025 }, -1, { day: 1, month: 1, year: 2024 }],
  ])('checks if updateYear %s year value', async (text, setValue, operation, res) => {
    wrapper.vm.setValue = setValue
    await wrapper.vm.updateYear(operation)
    expect(wrapper.vm.setValue).toEqual(res)
  })
  it('checks if selectMonth updates setValue month value and hides month view', () => {
    const month = 10
    wrapper.vm.setValue = { day: 1, month: 1, year: 2025 }
    wrapper.vm.selectMonth(month)
    expect(wrapper.vm.setValue).toEqual({ day: 1, month, year: 2025 })
    expect(wrapper.vm.showMonthView).toEqual(false)
  })
  it.each([
    [
      'sets startVal and selected when startVal is empty',
      {},
      {},
      { number: 5, month: 3, year: 2024 },
      { startVal: { day: 5, month: 3, year: 2024 }, endVal: {}, selected: { value: [1] } },
    ],
    [
      'sets startVal and selected when selected day is before startVal (same month/year)',
      { day: 10, month: 3, year: 2024 },
      {},
      { number: 5, month: 3, year: 2024 },
      { startVal: { day: 5, month: 3, year: 2024 }, endVal: {}, selected: { value: [1] } },
    ],
    [
      'sets startVal and selected when selected day is before startVal (same year, previous month)',
      { day: 10, month: 4, year: 2024 },
      {},
      { number: 15, month: 3, year: 2024 },
      { startVal: { day: 15, month: 3, year: 2024 }, endVal: {}, selected: { value: [1] } },
    ],
    [
      'sets startVal and selected when selected day is before startVal (previous year)',
      { day: 10, month: 3, year: 2025 },
      {},
      { number: 15, month: 3, year: 2024 },
      { startVal: { day: 15, month: 3, year: 2024 }, endVal: {}, selected: { value: [1] } },
    ],
    [
      'sets endVal and selected when endVal is empty and selected day is after startVal',
      { day: 5, month: 3, year: 2024 },
      {},
      { number: 10, month: 3, year: 2024 },
      {
        startVal: { day: 5, month: 3, year: 2024 },
        endVal: { day: 10, month: 3, year: 2024 },
        selected: { value: [1, 1] },
      },
    ],
    [
      'resets endVal and sets startVal if endVal is already set',
      { day: 5, month: 3, year: 2024 },
      { day: 10, month: 3, year: 2024 },
      { number: 15, month: 3, year: 2024 },
      { startVal: { day: 15, month: 3, year: 2024 }, endVal: {}, selected: { value: [1] } },
    ],
  ])('checks if selectDay %s', async (_desc, startVal, endVal, day, expected) => {
    wrapper.vm.startVal = { ...startVal }
    wrapper.vm.endVal = { ...endVal }
    wrapper.vm.selectDay(day)
    expect(wrapper.vm.selected).toEqual(expected.selected)
    expect(wrapper.vm.startVal).toEqual(expected.startVal)
    expect(wrapper.vm.endVal).toEqual(expected.endVal)
  })
  it('checks if selectedDayStart returns that selected day is start day', () => {
    const day = { number: 1, month: 1, year: 2025 }
    wrapper.vm.startVal = { day: 1, month: 1, year: 2025 }
    expect(wrapper.vm.selectedDayStart(day)).toBe(true)
  })
  it('checks if selectedDayEnd returns that selected day is end day', () => {
    const day = { number: 1, month: 1, year: 2025 }
    wrapper.vm.endVal = { day: 1, month: 1, year: 2025 }
    expect(wrapper.vm.selectedDayEnd(day)).toBe(true)
  })
  it.each([
    [10, true, false, true],
    [10, false, true, true],
    [10, false, false, false],
  ])(
    'checks if selectedHighlight returns that day is interval start or end #%#',
    async (val, start, end, res) => {
      wrapper.vm.selectedDayStart = vi.fn().mockReturnValue(start)
      wrapper.vm.selectedDayEnd = vi.fn().mockReturnValue(end)
      expect(wrapper.vm.selectedHighlight(val)).toEqual(res)
    },
  )
  it.each([
    [
      'its between start and end days',
      { number: 10, month: 1, year: 2025 },
      { day: 5, month: 1, year: 2025 },
      { day: 15, month: 1, year: 2025 },
      true,
    ],
    [
      'month between start and end months',
      { number: 10, month: 2, year: 2025 },
      { day: 5, month: 1, year: 2025 },
      { day: 15, month: 3, year: 2025 },
      true,
    ],
    [
      'month is not between start and end months',
      { number: 10, month: 1, year: 2025 },
      { day: 5, month: 2, year: 2025 },
      { day: 15, month: 3, year: 2025 },
      false,
    ],
    [
      'year is between start and end years',
      { number: 10, month: 1, year: 2025 },
      { day: 5, month: 2, year: 2021 },
      { day: 15, month: 3, year: 2026 },
      true,
    ],
    [
      'year is between start and end years',
      { number: 10, month: 1, year: 2025 },
      { day: 5, month: 2, year: 2024 },
      { day: 15, month: 3, year: 2026 },
      true,
    ],
    [
      'year is same as start year',
      { number: 10, month: 1, year: 2025 },
      { day: 5, month: 1, year: 2025 },
      { day: 15, month: 3, year: 2026 },
      true,
    ],
    [
      'year is not between start and end years',
      { number: 10, month: 1, year: 2024 },
      { day: 5, month: 1, year: 2025 },
      { day: 15, month: 1, year: 2025 },
      false,
    ],
    [
      'day is not between start and end days',
      { number: 4, month: 1, year: 2025 },
      { day: 5, month: 1, year: 2025 },
      { day: 15, month: 1, year: 2025 },
      false,
    ],
  ])('checks if intervalHighlight is highlighted day when %s', (text, day, start, end, res) => {
    wrapper.vm.startVal = start
    wrapper.vm.endVal = end
    expect(wrapper.vm.intervalHighlight(day)).toBe(res)
  })
  it('checks if toggleOpen closes field if its already open', async () => {
    wrapper.vm.open = true
    const onCloseSpy = vi.spyOn(wrapper.vm, 'onClose')
    wrapper.vm.toggleOpen()
    expect(onCloseSpy).toHaveBeenCalled()
  })
  it('checks if toggleOpen opens field if its closed', () => {
    wrapper.setProps({ modelValue: [] })
    wrapper.vm.open = false
    wrapper.vm.selected = { value: [] }
    wrapper.vm.toggleOpen()
    expect(wrapper.vm.open).toBe(true)
    expect(wrapper.vm.selected.value).toEqual([])
  })
  it.each([
    [
      'returns placeholder if no value selected',
      { selected: { value: [] }, startVal: {}, endVal: {} },
      'Select a date',
    ],
    [
      'returns formatted string for single date',
      {
        selected: { value: [1234567890] },
        startVal: { year: 2024, month: 4, day: 15 },
        endVal: {},
      },
      'May 15, 2024',
    ],
    [
      'returns formatted string for range in same year',
      {
        selected: { value: [1234567890, 1234567999] },
        startVal: { year: 2024, month: 4, day: 15 },
        endVal: { year: 2024, month: 5, day: 2 },
      },
      'May 15 - June 2, 2024',
    ],
    [
      'returns formatted string for range in different years',
      {
        selected: { value: [1234567890, 2234567890] },
        startVal: { year: 2023, month: 11, day: 31 },
        endVal: { year: 2024, month: 0, day: 1 },
      },
      'Dec 31, 2023 - Jan 1, 2024',
    ],
  ])('checks if parseValue %s', (text, state, expected) => {
    wrapper.vm.selected = state.selected
    wrapper.vm.startVal = state.startVal
    wrapper.vm.endVal = state.endVal
    expect(wrapper.vm.parseValue()).toBe(expected)
  })
  it('checks if onApply updates displayValue and open values and emits update', async () => {
    const spy = vi.spyOn(wrapper.vm, 'parseValue').mockReturnValue('123')
    wrapper.vm.selected = { value: [123, 456] }
    wrapper.vm.open = true
    wrapper.vm.onApply()
    expect(wrapper.vm.displayValue).toBe('123')
    expect(wrapper.vm.open).toBe(false)
    expect(wrapper.emitted('update')).toBeTruthy()
    spy.mockRestore()
  })
  it('checks if clearField resets values correctly', async () => {
    await wrapper.vm.clearField(false)
    expect(wrapper.vm.startVal).toEqual({})
    expect(wrapper.vm.endVal).toEqual({})
    expect(wrapper.vm.setValue).toEqual({ year: 1, month: 0, day: 1 })
    expect(wrapper.vm.selected.value).toEqual([])
    expect(wrapper.vm.displayValue).toEqual('Select a date')
  })
  it('checks if onClose resets values correctly when modelValue is empty', async () => {
    await wrapper.vm.onClose()
    expect(wrapper.vm.startVal).toEqual({})
    expect(wrapper.vm.endVal).toEqual({})
    expect(wrapper.vm.setValue).toEqual({ year: 1, month: 0, day: 1 })
    expect(wrapper.vm.selected.value).toEqual([])
    expect(wrapper.vm.open).toBe(false)
  })
  it('checks if unixToDate returns correct year, month, day from unix timestamp', () => {
    const result = wrapper.vm.unixToDate(1234567890)
    expect(result).toEqual({ year: 1, month: 0, day: 1 })
  })
  it('checks if dateToUnix returns correct value array for single date', () => {
    const start = { year: 2024, month: 4, day: 15 }
    const result = wrapper.vm.dateToUnix(start)
    expect(result).toEqual({ value: [1] })
  })
  it('checks if dateToUnix returns correct value array for date range', () => {
    const start = { year: 2024, month: 4, day: 15 }
    const end = { year: 2024, month: 4, day: 20 }
    const result = wrapper.vm.dateToUnix(start, end)
    expect(result).toEqual({ value: [1, 1] })
  })
})
