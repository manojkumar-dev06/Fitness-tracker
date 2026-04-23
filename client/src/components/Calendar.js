import React, { useState, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';

// Setup the localizer by providing the moment (or globalize, or the Angular or Luxon) Object
// to the correct localizer.
const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

// Configure the localizer with date-fns
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: {
    'en-US': require('date-fns/locale/en-US')
  },
});

// Custom event component to display in the calendar
const CustomEvent = ({ event }) => {
  return (
    <div className="rbc-event-content">
      <div className="event-type">
        {event.type === 'cardio' ? '🏃' : '🏋️'}
      </div>
      <div className="event-title">{event.title}</div>
      {event.details && <div className="event-details">{event.details}</div>}
    </div>
  );
};
const CustomToolbar = ({ label, onNavigate, onView }) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('TODAY')}>
          Today
        </button>
        <button type="button" onClick={() => onNavigate('PREV')}>
          ❮
        </button>
        <button type="button" onClick={() => onNavigate('NEXT')}>
          ❯
        </button>
      </span>
      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onView(Views.MONTH)}>
          Month
        </button>
        <button type="button" onClick={() => onView(Views.WEEK)}>
          Week
        </button>
        <button type="button" onClick={() => onView(Views.DAY)}>
          Day
        </button>
        <button type="button" onClick={() => onView(Views.AGENDA)}>
          Agenda
        </button>
      </span>
    </div>
  );
};

const Calendar = ({ workouts }) => {
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  // Format workout data for the calendar
  const events = workouts.map(workout => ({
    id: workout._id,
    title: workout.name,
    type: workout.type,
    start: new Date(workout.date),
    end: new Date(new Date(workout.date).getTime() + 30 * 60000), // Default 30 min duration
    details: workout.type === 'cardio' 
      ? `${workout.distance} km in ${workout.duration} min`
      : `${workout.sets} x ${workout.reps} @ ${workout.weight}kg`,
    allDay: false,
  }));

  const handleSelectEvent = useCallback(
    (event) => {
      navigate(`/history/${event.type}/${event.id}`);
    },
    [navigate]
  );

  const handleNavigate = useCallback((newDate) => {
    setDate(newDate);
  }, []);

  const handleView = useCallback((newView) => {
    setView(newView);
  }, []);

  // Custom styling for different event types
  const eventStyleGetter = (event) => {
    let backgroundColor = event.type === 'cardio' ? '#3174ad' : '#5cb85c';
    let style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      padding: '2px 5px',
    };
    return { style };
  };

  return (
    <div style={{ height: '80vh', padding: '20px' }}>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        components={{
          event: CustomEvent,
          toolbar: (props) => (
            <CustomToolbar
              {...props}
              onNavigate={handleNavigate}
              onView={handleView}
            />
          ),
        }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        view={view}
        onView={handleView}
        date={date}
        onNavigate={handleNavigate}
        popup
        selectable
        defaultView={Views.MONTH}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
      />
    </div>
  );
};

export default Calendar;
