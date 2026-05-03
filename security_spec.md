# Security Specification for مأوى (Shelter)

## 1. Data Invariants
- Properties can be read by anyone (publicly available listings).
- Properties can only be written by admins (simulated for now, or restrictive for demo).
- Bookings must belong to a valid user.
- A user can only read and write their own bookings.
- User profiles can only be read/written by the owner.

## 2. The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Attempt to create a booking for another user’s `userId`.
2. **Resource Poisoning**: Create a property with a 5MB description string.
3. **State Shortcutting**: Directly update a booking status to 'confirmed' without payment.
4. **Owner Hijack**: Update the `userId` of an existing booking to 'someone-else'.
5. **PII Leak**: Random user querying the `users` collection without filtering by their own UID.
6. **Admin Escalation**: User trying to mark themselves as `isAdmin` in their profile.
7. **Phantom Booking**: Create a booking for a non-existent `propertyId`.
8. **Invalid ID**: Injecting scripts or massive strings as Document IDs.
9. **Unauthorized Delete**: Anonymous user trying to delete a property.
10. **Price Manipulation**: Create a booking with $0 total price for an expensive property.
11. **Negative Price**: Set `pricePerNight` to a negative number in property creation.
12. **Shadow Field**: Adding `isVerified: true` to a user profile where it's not in the schema.

## 3. Test Runner
(Tests will be simulated via draft rules evaluation)
