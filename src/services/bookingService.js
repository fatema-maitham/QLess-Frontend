import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  toList,
} from "./api";

export function createBooking(serviceId, booking, { signal } = {}) {
  return apiPost(`/services/${serviceId}/bookings`, booking, { signal });
}

export async function getMyBookings({ signal } = {}) {
  const data = await apiGet("/bookings/me", { signal });
  return toList(data);
}

export async function getBranchBookings(
  branchId,
  { status, bookingDate, signal } = {}
) {
  const data = await apiGet(`/branches/${branchId}/bookings`, {
    params: {
      status,
      booking_date: bookingDate,
    },
    signal,
  });

  return toList(data);
}

export function getBooking(bookingId, { signal } = {}) {
  return apiGet(`/bookings/${bookingId}`, { signal });
}

export function rescheduleBooking(
  bookingId,
  booking,
  { signal } = {}
) {
  return apiPatch(`/bookings/${bookingId}`, booking, { signal });
}

export function updateBookingStatus(
  bookingId,
  status,
  { signal } = {}
) {
  return apiPatch(
    `/bookings/${bookingId}`,
    { status },
    { signal }
  );
}

export function cancelBooking(bookingId, { signal } = {}) {
  return apiDelete(`/bookings/${bookingId}`, { signal });
}