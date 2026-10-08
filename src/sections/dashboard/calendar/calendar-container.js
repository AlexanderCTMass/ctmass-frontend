import { alpha, styled } from '@mui/material/styles';

export const CalendarContainer = styled('div')(({ theme }) => ({
  '& .fc-license-message': {
    display: 'none'
  },
  '& .fc': {
    '--fc-bg-event-opacity': 1,
    '--fc-border-color': 'rgba(31,45,119,0.08)',
    '--fc-daygrid-event-dot-width': '10px',
    '--fc-event-bg-color': theme.palette.primary.main,
    '--fc-event-border-color': theme.palette.primary.main,
    '--fc-event-text-color': theme.palette.primary.contrastText,
    '--fc-list-event-hover-bg-color': theme.palette.background.default,
    '--fc-neutral-bg-color': theme.palette.background.default,
    '--fc-page-bg-color': theme.palette.background.default,
    '--fc-today-bg-color': alpha('#16B364', 0.07),
    color: theme.palette.text.primary,
    fontFamily: theme.typography.fontFamily
  },
  '& .fc .fc-col-header-cell-cushion': {
    paddingBottom: '10px',
    paddingTop: '10px',
    fontSize: 13,
    fontWeight: 700,
    color: '#6C737F',
    textTransform: 'none'
  },
  '& .fc .fc-day-other .fc-daygrid-day-top': {
    color: theme.palette.text.secondary
  },
  '& .fc .fc-day-today .fc-daygrid-day-number': {
    color: '#16B364',
    fontWeight: 800
  },
  '& .fc-daygrid-event': {
    borderRadius: '8px',
    padding: '0px 4px',
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    lineHeight: theme.typography.subtitle2.lineHeight
  },
  '& .fc-daygrid-block-event .fc-event-time': {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.body2.fontWeight,
    lineHeight: theme.typography.body2.lineHeight
  },
  '& .fc-daygrid-day-frame': {
    padding: '12px'
  },
  '& .fc-scrollgrid': {
    borderColor: 'transparent'
  },
  '& .fc-scrollgrid td:last-of-type': {
    borderRightColor: 'transparent'
  },
  '& .fc-scrollgrid-section.fc-scrollgrid-section-body td[role="presentation"]': {
    borderBottomColor: 'transparent'
  },
  '& [role="row"]:last-of-type td': {
    borderBottomColor: 'transparent'
  },
  '& th[role="presentation"]': {
    borderRightColor: 'transparent'
  },
  '& .fc-list': {
    borderColor: 'transparent'
  }
}));
