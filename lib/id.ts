import { format } from 'date-fns';

function randomSegment(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

export function generateClientCode(date = new Date()) {
  return `CL-${format(date, 'yyyyMMdd')}-${randomSegment(5)}`;
}

export function generateLeadCode(date = new Date()) {
  return `LD-${format(date, 'yyyyMMdd')}-${randomSegment(5)}`;
}

export function generateEventId(date = new Date()) {
  return `EV-${format(date, 'yyyyMMdd-HHmmss')}-${randomSegment(5)}`;
}
