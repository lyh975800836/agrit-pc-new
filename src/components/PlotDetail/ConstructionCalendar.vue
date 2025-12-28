<template>
  <div class="construction-calendar">
    <div class="calendar-header">
      <span class="calendar-month">{{ calendarData.monthDisplay }}</span>
    </div>
    <div class="calendar-grid">
      <div
        v-for="day in calendarData.daysInMonth"
        :key="day"
        class="calendar-day"
        :class="{ 'has-schedule': calendarData.scheduledDays.includes(day) }"
        @click="$emit('day-selected', day)"
      >
        <span class="day-number">{{ day }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'ConstructionCalendar',
    props: {
        calendarData: {
            type: Object,
            required: true,
            validator: (val) => {
                return val.monthDisplay && val.daysInMonth && val.scheduledDays
            }
        }
    },
    emits: ['day-selected']
}
</script>

<style lang="less" scoped>
.construction-calendar {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10px 0;
    padding: 15px 10px;

    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
}

.calendar-header {
    width: 100%;
    margin-bottom: 15px;
    text-align: center;
}

.calendar-month {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #c69c6d;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    width: 100%;
    gap: 5px;
}

.calendar-day {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    border: 1px solid #666;

    border-radius: 4px;
    background: rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;
    cursor: pointer;
}

.calendar-day:hover {
    border-color: #c69c6d;
    background: rgba(198, 156, 109, 0.1);
}

.calendar-day.has-schedule {
    border-color: #c69c6d;
    background: #c69c6d;
}

.calendar-day.has-schedule .day-number {
    font-weight: bold;
    color: #000;
}

.day-number {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #c69c6d;
}
</style>
