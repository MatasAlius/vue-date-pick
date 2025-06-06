# vue-date-pick

@matasalius/vue-date-pick - Vue 3 Date range picker component

![Screenshot](https://github.com/MatasAlius/vue-date-pick/blob/main/screenshots/img3.png)

This component provides a customizable date range picker UI for Vue 3 applications. It supports selecting a date range, custom placeholders, localization, and time zones.

## Props

- modelValue: Array (default: []) - the selected date range as an array of Unix timestamps. To convert value to date you can use `new Date(unix_timestamp * 1000)` or using day.js `dayjs.unix(unix_timestamp)`. Use v-model for two-way binding.
- placeholder: String (default: '') - placeholder text when no date is selected.
- minYear: Number (default: 1970) - the minimum selectable year.
- timeZone: String (default: 'UTC') - the time zone for date calculations and display.
- lang: String (default: 'en') - the language/locale for date formatting.

## Emits

- open: Emitted when the calendar is opened.
- close: Emitted when the calendar is closed.
- update:modelValue: Emitted with the selected date range array when selection changes.

## Features

- Click to open/close the calendar popup.
- Select a start and end date by clicking days.
- Drag to select a range.
- Switch between month and day views.
- Clear and Apply Filter buttons for user actions.
- Highlights today, selected days, and the interval between them.
- Keyboard navigation and accessibility support.
- Customizable via slots for icons and selected option display.
- Responsive and styled with custom CSS (no Tailwind required).

## Dependencies

- dayjs (with utc, timezone, duration plugins and multiple locales)

## Usage Example

### Installation

`npm install @matasalius/vue-date-pick`

### Basic example

```
<template>
  <div>
    <DatePick v-model="dateRange" />
    <div style="margin-top: 1rem"><strong>Selected:</strong> {{ dateRange }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DatePick from '@matasalius/vue-date-pick'

const dateRange = ref([])
</script>
```

## Example with emits

```
<template>
  <div>
    <DatePick
     v-model="dateRange"
     placeholder="Pick a date range
     @open="onOpen" @close="onClose"
     @update:modelValue="onUpdate"
    />
    <div style="margin-top: 1rem"><strong>Selected:</strong> {{ dateRange }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DatePick from '@matasalius/vue-date-pick'

const dateRange = ref([])

function onOpen() {
  console.log('Calendar opened')
}
function onClose() {
  console.log('Calendar closed')
}
function onUpdate(val) {
  console.log('Date range updated:', val)
}
</script>
```

## Screenshots

![Screenshot 1](https://github.com/MatasAlius/vue-date-pick/blob/main/screenshots/img1.png)

![Screenshot 2](https://github.com/MatasAlius/vue-date-pick/blob/main/screenshots/img2.png)

![Screenshot 3](https://github.com/MatasAlius/vue-date-pick/blob/main/screenshots/img3.png)

![Screenshot 4](https://github.com/MatasAlius/vue-date-pick/blob/main/screenshots/img4.png)

![Screenshot 5](https://github.com/MatasAlius/vue-date-pick/blob/main/screenshots/img5.png)