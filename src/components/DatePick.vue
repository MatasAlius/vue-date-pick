<template>
  <div class="input-area">
    <div id="select-date">
      <div
        id="select-date"
        class="input-field"
        :class="{ 'text-placeholder': !modelValue?.length }"
        @click="toggleOpen"
        @keydown.enter="toggleOpen"
        @keydown.esc="onClose"
      >
        <div class="input-row">
          <div class="input-icon">
            <slot name="icon">
              <IconCalendar />
            </slot>
          </div>
          <div class="input-selected-option">
            <slot name="selectedOption">
              {{ displayValue }}
            </slot>
          </div>
          <div class="input-icon">
            <IconArrow :class="{ 'icon-rotate-180': open }" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="open" @update:open="onClose" class="input-calendar">
      <div class="grid grid-cols-2">
        <span class="calendar-year-nav">
          <IconArrow
            class="icon-rotate-90 pointer"
            :class="{ invisible: parseInt(setValue.year) <= minYear }"
            @click="updateYear(-1)"
          />
          <span class="calendar-year-value">
            {{ setValue.year }}
          </span>
          <IconArrow
            class="icon-rotate-270 pointer"
            :class="{
              invisible: noNextYear,
            }"
            @click="updateYear(1)"
          />
        </span>
        <span class="calendar-month-toggle" @click="showMonthView = !showMonthView">
          <span class="calendar-month-label">
            {{ showMonthView ? 'Day' : selectedMonthName }}
          </span>
        </span>
      </div>
      <template v-if="showMonthView">
        <div class="calendar-months-wrapper">
          <div class="grid grid-cols-3">
            <span v-for="(name, idx) in monthNames" :key="idx" class="calendar-month-cell">
              <span
                class="calendar-month-btn"
                :class="{
                  'calendar-month-btn-today': idx === today.getMonth(),
                  'calendar-month-btn-selected': idx === setValue.month,
                }"
                @click="selectMonth(idx)"
              >
                {{ name }}
              </span>
            </span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="calendar-days-wrapper" @mouseleave="handleEnd" @mouseup="handleEnd">
          <div v-for="(week, idx) in calendarView" :key="idx" class="calendar-week-row">
            <template v-if="idx === 0">
              <span v-for="(name, idx2) in week" :key="idx2" class="calendar-weekday-cell">
                {{ name }}
              </span>
            </template>
            <template v-else>
              <div
                v-for="(day, idx2) in week"
                :key="idx2"
                class="calendar-day-cell"
                :class="{
                  'day-highlight': intervalHighlight(day),
                  'calendar-rounded-l-full': selectedDayStart(day),
                  'calendar-gradient-to-l': selectedDayStart(day) && endVal.day,
                  'calendar-gradient-to-r calendar-rounded-r-full': selectedDayEnd(day),
                }"
              >
                <button
                  class="calendar-day-btn"
                  :class="{
                    'text-placeholder': day.previous || day.next,
                    'calendar-day-btn-today':
                      day.number === getTodays('day') &&
                      !day.previous &&
                      !day.next &&
                      day.year === getTodays(),
                  }"
                  @mousedown="handleStart($event, day)"
                  @mouseenter="handle(day)"
                  @mouseup="handleEnd"
                  @touchstart="handleStart($event, day)"
                  @touchend="handleEnd"
                >
                  <span
                    :class="{
                      'calendar-day-btn-selected': selectedHighlight(day),
                    }"
                  >
                    {{ day.number }}
                  </span>
                </button>
              </div>
            </template>
          </div>
        </div>
        <div class="calendar-action-row">
          <button
            class="calendar-action-btn"
            button-id="clear"
            type="text"
            :disabled="!selected.value || selected.value.length < 2"
            @click="clearField"
          >
            {{ 'Clear' }}
          </button>
          <button
            class="calendar-action-btn calendar-action-btn-apply"
            :class="{
              'action-btn-disable': !selected.value || selected.value.length < 2,
            }"
            button-id="apply"
            button-type="submit"
            @click="onApply"
          >
            {{ 'Apply Filter' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import IconCalendar from './icons/IconCalendar.vue'
import IconArrow from './icons/IconArrow.vue'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import duration from 'dayjs/plugin/duration'
import 'dayjs/locale/es'
import 'dayjs/locale/de'
import 'dayjs/locale/ja'
import 'dayjs/locale/pt'
import 'dayjs/locale/tr'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)

export default {
  name: 'date-pick',
  components: {
    IconCalendar,
    IconArrow,
  },
  props: {
    modelValue: {
      type: Array,
      default: [],
    },
    placeholder: {
      type: String,
      default: '',
    },
    minYear: {
      type: Number,
      default: 1970,
    },
    timeZone: {
      type: String,
      default: 'UTC',
    },
    lang: {
      type: String,
      default: 'en',
    },
  },
  emits: ['open', 'close', 'update:modelValue'],
  data() {
    return {
      selected: {},
      open: false,
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      monthNames: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'June',
        'July',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec',
      ],
      showMonthView: false,
      setValue: { year: null, month: null, day: null },
      startVal: {},
      endVal: {},
      today: new Date(),
      drag: false,
      displayValue: 'Select a date',
    }
  },
  computed: {
    calendarView() {
      const normalWeekDays = [6, 0, 1, 2, 3, 4, 5]
      const year = this.setValue.year
      const month = this.setValue.month
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const firstDay = normalWeekDays[new Date(year, month, 1).getDay()]

      let daysArray = []
      let week = []
      for (let i = 0; i < firstDay; i++) {
        week.push({
          number: new Date(year, month, -firstDay + i + 1).getDate(),
          previous: true,
          month: month === 0 ? 11 : month - 1,
          year: month === 0 ? year - 1 : year,
        })
      }
      for (let day = 1; day <= daysInMonth; day++) {
        week.push({ number: day, month: month, year: year })
        if (week.length === 7) {
          daysArray.push(week)
          week = []
        }
      }
      let nextMonthDay = 1
      while (week.length > 0 && week.length < 7) {
        week.push({
          number: nextMonthDay++,
          next: true,
          month: month === 11 ? 0 : month + 1,
          year: month === 11 ? year + 1 : year,
        })
      }
      if (week.length > 0) {
        daysArray.push(week)
      }
      daysArray.unshift(this.daysOfWeek)

      return daysArray
    },
    defaultPlaceholder() {
      return this.placeholder || 'Select a date'
    },
    noNextYear() {
      return (
        parseInt(this.setValue.year) >=
        this.localDate(this.today.getTime() / 1000, { format: 'YYYY' })
      )
    },
    selectedMonthName() {
      return this.localDate(new Date(this.setValue.year, this.setValue.month, 1).getTime() / 1000, {
        format: 'MMMM',
      })
    },
  },
  watch: {
    open(open) {
      if (open) this.$emit('open')
      else this.$emit('close')
    },
    modelValue(newVal) {
      if (newVal.length === 0) this.clearField(true)
    },
  },
  mounted() {
    this.setValue = {
      year: parseInt(this.localDate(this.today.getTime() / 1000, { format: 'YYYY' })),
      month: parseInt(this.localDate(this.today.getTime() / 1000, { format: 'M' })) - 1,
      day: parseInt(this.localDate(this.today.getTime() / 1000, { format: 'D' })),
    }
  },
  methods: {
    localDate(timestamp, options = {}) {
      if (!timestamp) return '-'
      const { format = 'YYYY-MM-DD HH:mm:ss' } = options
      const date = dayjs(timestamp * 1000)
      if (this.timeZone && this.timeZone !== 'UTC') {
        return date.locale(this.lang).tz(this.timeZone).format(format)
      }
      return date.locale(this.lang).utc().format(format)
    },
    handleStart(e, day) {
      this.drag = true
      e.preventDefault()
      this.selectDay(day)
    },
    handleEnd() {
      this.drag = false
    },
    handle(day) {
      if (Object.keys(this.startVal).length === 0) return
      if (this.drag) {
        if (
          (day.year === this.startVal.year &&
            day.month === this.startVal.month &&
            day.number < this.startVal.day) ||
          (day.month < this.startVal.month && day.year <= this.startVal.year) ||
          day.year < this.startVal.year
        ) {
          return
        }
        this.setValue = { day: day.number, month: day.month, year: day.year }
        this.endVal = { ...this.setValue }
        this.selected = this.dateToUnix(this.startVal, this.endVal)
      }
    },
    getTodays(param) {
      switch (param) {
        case 'day':
          return this.today.getMonth() === this.setValue.month
            ? parseInt(this.localDate(this.today.getTime() / 1000, { format: 'D' }))
            : null
        case 'month':
          return parseInt(this.localDate(this.today.getTime() / 1000, { format: 'M' })) - 1
        default:
          return parseInt(this.localDate(this.today.getTime() / 1000, { format: 'YYYY' }))
      }
    },
    updateYear(operation) {
      this.setValue.year += operation
    },
    selectMonth(month) {
      this.setValue.month = month
      this.showMonthView = false
    },
    selectDay(day) {
      this.setValue = { day: day.number, month: day.month, year: day.year }
      const isstartValEmpty = Object.keys(this.startVal).length === 0
      const isBeforestartVal =
        this.startVal?.year === this.setValue.year &&
        this.startVal?.month === this.setValue.month &&
        this.setValue.day < this.startVal?.day
      const isMonthBeforestartVal =
        this.setValue.year === this.startVal?.year && this.setValue.month < this.startVal?.month
      const isYearBeforestartVal = this.setValue.year < this.startVal?.year

      if (isstartValEmpty || isBeforestartVal || isMonthBeforestartVal || isYearBeforestartVal) {
        this.startVal = { ...this.setValue }
        this.endVal = {}
        this.selected = this.dateToUnix(this.setValue)
      } else if (Object.keys(this.endVal).length === 0) {
        this.endVal = { ...this.setValue }
        this.selected = this.dateToUnix(this.startVal, this.endVal)
      } else {
        this.startVal = { ...this.setValue }
        this.endVal = {}
        this.selected = this.dateToUnix(this.setValue)
      }
    },
    selectedDayStart(day) {
      return (
        day.number === this.startVal.day &&
        day.month === this.startVal.month &&
        day.year === this.startVal.year
      )
    },
    selectedDayEnd(day) {
      return (
        day.number === this.endVal.day &&
        day.month === this.endVal.month &&
        day.year === this.endVal.year
      )
    },
    selectedHighlight(day) {
      return this.selectedDayStart(day) || this.selectedDayEnd(day)
    },
    intervalHighlight(day) {
      const checkDayBetweenStartEnd =
        day.number > this.startVal.day &&
        day.number < this.endVal.day &&
        ((day.month === this.startVal.month && day.year === this.startVal.year) ||
          (day.month === this.endVal.month && day.year === this.endVal.year))
      const checkMonthBetweenStartEnd =
        day.month > this.startVal.month &&
        day.month < this.endVal.month &&
        day.year >= this.startVal.year &&
        day.year <= this.endVal.year
      const checkMonthBetweenStartEndYears =
        (day.year >= this.startVal.year &&
          day.month > this.startVal.month &&
          this.endVal.year &&
          day.year < this.endVal.year) ||
        (day.year <= this.endVal.year &&
          day.month < this.endVal.month &&
          day.year > this.startVal.year)
      const checkStartMonthDiffYear =
        (day.year === this.startVal.year &&
          day.month === this.startVal.month &&
          day.number > this.startVal.day &&
          day.year < this.endVal.year) ||
        (day.year === this.endVal.year &&
          day.month === this.endVal.month &&
          day.number < this.endVal.day &&
          day.year > this.startVal.year)
      const checkDayLaterThanStart =
        day.number > this.startVal.day &&
        day.month === this.startVal.month &&
        day.year === this.startVal.year &&
        this.endVal.month &&
        day.month !== this.endVal.month
      const checkDayEarlierThanEnd =
        day.number < this.endVal.day &&
        day.month === this.endVal.month &&
        day.year === this.endVal.year &&
        day.month !== this.startVal.month
      return (
        checkDayBetweenStartEnd ||
        checkMonthBetweenStartEnd ||
        checkDayLaterThanStart ||
        checkDayEarlierThanEnd ||
        checkMonthBetweenStartEndYears ||
        checkStartMonthDiffYear
      )
    },
    parseValue() {
      if (!this.selected.value || this.selected.value.length === 0) return this.defaultPlaceholder
      const start = this.startVal
      const end = this.endVal
      if (!end || Object.keys(end).length === 0) {
        return `${this.monthNames[start.month]} ${start.day}, ${start.year}`
      }
      if (start.year !== end.year) {
        return `${this.monthNames[start.month]} ${start.day}, ${start.year} - ${this.monthNames[end.month]} ${end.day}, ${end.year}`
      }
      return `${this.monthNames[start.month]} ${start.day} - ${this.monthNames[end.month]} ${end.day}, ${end.year}`
    },
    toggleOpen() {
      if (this.open) return this.onClose()
      this.open = true
      if (this.modelValue?.length > 1)
        this.selected.value = [this.modelValue[0], this.modelValue[1]]
    },
    onApply() {
      if (!this.selected.value || this.selected.value.length < 2) return
      this.displayValue = this.parseValue()
      this.open = false
      this.$emit('update:modelValue', this.selected.value)
    },
    clearField(ignore) {
      this.startVal = {}
      this.endVal = {}
      this.setValue = {
        year: parseInt(this.localDate(this.today.getTime() / 1000, { format: 'YYYY' })),
        month: parseInt(this.localDate(this.today.getTime() / 1000, { format: 'M' })) - 1,
        day: parseInt(this.localDate(this.today.getTime() / 1000, { format: 'D' })),
      }
      this.selected.value = []
      this.displayValue = this.parseValue()
      if (ignore !== true) {
        this.$emit('update:modelValue', this.selected.value)
      }
    },
    onClose() {
      const startVal = this.modelValue[0] ? this.unixToDate(this.modelValue[0]) : {}
      const endVal = this.modelValue[1] ? this.unixToDate(this.modelValue[1]) : {}
      this.startVal = startVal
      this.endVal = endVal
      this.setValue = {
        year: parseInt(this.localDate(this.today.getTime() / 1000, { format: 'YYYY' })),
        month: parseInt(this.localDate(this.today.getTime() / 1000, { format: 'M' })) - 1,
        day: parseInt(this.localDate(this.today.getTime() / 1000, { format: 'D' })),
      }
      this.selected.value = []
      this.open = false
    },
    unixToDate(val) {
      const userTimeZone = this.timeZone
      const date = dayjs.unix(val).tz(userTimeZone)
      return { year: date.year(), month: date.month(), day: date.date() }
    },
    dateToUnix(start, end) {
      const userTimeZone = this.timeZone
      if (!end) {
        return {
          value: [dayjs.tz(`${start.year}-${start.month + 1}-${start.day}`, userTimeZone).unix()],
        }
      }
      return {
        value: [
          dayjs.tz(`${start.year}-${start.month + 1}-${start.day}`, userTimeZone).unix(),
          dayjs.tz(`${end.year}-${end.month + 1}-${end.day} 23:59:59`, userTimeZone).unix(),
        ],
      }
    },
  },
}
</script>

<style>
.input-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
}
.input-selected-option {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.75rem;
}
.input-calendar-icon {
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
}
.flex {
  display: flex;
}
.input-icon {
  display: flex;
  align-items: center;
}
.dropdown-arrow-icon {
  transition: transform 0.3s;
  width: 1.25rem;
  height: 1.25rem;
}
.icon-rotate-180 {
  transform: rotate(180deg);
}
.icon-rotate-90 {
  transform: rotate(90deg);
}
.icon-rotate-270 {
  transform: rotate(270deg);
}
.with-fade::before {
  content: ' ';
  position: absolute;
  top: 0;
  bottom: 0;
  right: calc(100% + 0.5rem - 1px);
  --fade-clr: 255, 255, 255;
  width: 6rem;
  pointer-events: none;
  background-image: linear-gradient(to left, rgba(var(--fade-clr)), rgb(255, 255, 255, 0));
}
.input-area {
  position: relative;
  font-family: sans-serif;
  color: #000000;
  width: 100%;
}
.input-area {
  max-width: min(311px, calc(100vw - 4rem));
}
@media (min-width: 768px) {
  .input-area {
    max-width: 20rem;
  }
}
.input-field {
  margin-left: 1px;
  margin-right: 1px;
  margin-top: 1px;
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
  min-height: 2rem;
  outline: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  max-width: 20rem;
  width: 100%;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  width: 300px;
  display: block;
  background: #fff;
  color: #374151;
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: hidden;
  min-width: 0;
}
input.input-field:read-only {
  background: #f3f4f6;
  outline: none;
  color: #d1d5db;
  cursor: not-allowed;
}
.input-field:focus,
.input-field:hover {
  outline: 1px solid #3b82f6;
}
.input-calendar {
  margin-left: 1px;
  margin-right: 1px;
  margin-top: 5px;
  width: 300px;
  padding: 0.5rem;
  min-height: 2rem;
  outline: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}
.invisible {
  visibility: hidden;
}
.grid {
  display: grid;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.grid-cols-7 {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
.content-center {
  align-content: center;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-items: center;
}
.calendar-year-nav {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}
.calendar-year-value {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #000000;
}
.calendar-month-toggle {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
}
.calendar-month-label {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}
.calendar-month-cell {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.calendar-month-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 100%;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  border-radius: 0.375rem;
}
.calendar-month-btn:hover {
  color: #3b82f6;
  background: #f3f4f6;
}
.calendar-month-btn-today {
  border: 1px solid #3b82f6;
  color: #3b82f6;
}
.calendar-month-btn-selected {
  background: #3b82f6;
  color: #fff;
}
.calendar-months-wrapper {
  padding: 1rem;
}
.calendar-days-wrapper {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.calendar-week-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  align-content: center;
  align-items: center;
  justify-items: center;
}
.calendar-weekday-cell {
  display: grid;
  align-content: center;
  align-items: center;
  justify-items: center;
}
.calendar-day-cell {
  display: grid;
  align-content: center;
  align-items: center;
  justify-items: center;
  width: 100%;
  box-sizing: border-box;
}
.calendar-day-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
}
.calendar-day-btn:hover {
  color: #3b82f6;
  background: #f3f4f6;
  border-radius: 10%;
}
.calendar-day-btn-today {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10%;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  z-index: 10;
}
.calendar-day-btn-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50%;
  border-radius: 10%;
  background: #3b82f6;
  color: #fff;
  z-index: 10;
}
.pointer {
  cursor: pointer;
}
.text-placeholder {
  color: #5b6069;
}
.calendar-action-row {
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  align-items: center;
}
.calendar-action-btn {
  padding: 0.375rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 0.375rem;
}
.calendar-action-btn-apply {
  margin-left: auto;
  background: #3b82f6;
  color: #fff;
}
.action-btn-disable {
  background: #e5e7eb;
  color: #9ca3af;
}
.day-highlight {
  background-color: #bfdbfe;
}
.calendar-gradient-to-l {
  background-image: linear-gradient(to left, #bfdbfe, transparent);
}
.calendar-gradient-to-r {
  background-image: linear-gradient(to right, #bfdbfe, transparent);
}
</style>
