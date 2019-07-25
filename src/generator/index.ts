export type Room = {
    id: number,
    min: number,
    max: number
};

export type DesiredRoom = Room & {
    assigned: number
}

export type Guest = {
    id: number,
    desiredTimeslots: number,
    desiredRooms: Room[],
    tags: string[]
};

export type InternalGuest = Guest & {
    desiredRooms: DesiredRoom[],
    assignedTimeslots: number,
}

export type InternalConstraint = Constraint & {
    id: number,
    count: number
};

export type PredicateFn = (value: Guest) => boolean;
export type Predicate = PredicateFn & { desc: string };

export const hasTag = (tag: string): Predicate => {
    const _hasTag = (guest: Guest) => guest.tags.includes(tag);
    _hasTag.desc = `has tag "${tag}"`
    return _hasTag;
}
export const not = (predicate: Predicate): Predicate => {
    const _not = (guest: Guest) => !predicate(guest);
    _not.desc = `NOT (${predicate.desc})`;
    return _not;
}
export const and = (...predicates: Predicate[]): Predicate => {
    const _and = (guest: Guest) => predicates.map(p => p(guest)).reduce((acc, e) => acc && e);
    _and.desc = predicates.map(p => `(${p.desc})`).join(" AND ");
    return _and;
}
export const or = (...predicates: Predicate[]): Predicate => {
    const _or = (guest: Guest) => predicates.map(p => p(guest)).reduce((acc, e) => acc || e);
    _or.desc = predicates.map(p => `(${p.desc})`).join(" OR ");
    return _or;
}

export const atMost = (max: number, predicate: Predicate): ConstraintInitializer => () => {
    let count = 0;
    const _atMost = (guest: Guest) => {
        return count < max && predicate(guest);
    }
    _atMost.desc = `AT MOST ${max} WHERE ${predicate.desc}`
    _atMost.satisfy = () => {
        count++;
    }
    return _atMost;
}

export type ConstraintInitializer = () => Constraint;
export type Constraint = (Predicate & { satisfy: () => void });

export type GuestSorterHeuristic = (guestA: InternalGuest, guestB: InternalGuest) => number;

export type Timetable = Record<number, number[]>;

function getDefaultGuestSorter(guests: InternalGuest[]): GuestSorterHeuristic {
    return function defaultGuestSorter(guestA: InternalGuest, guestB: InternalGuest) {
        if (guestA.assignedTimeslots != guestB.assignedTimeslots) {
            return guestA.assignedTimeslots - guestB.assignedTimeslots;
        } else {
            const guestAIndex = guests.indexOf(guestA);
            const guestBIndex = guests.indexOf(guestB);
            return guestAIndex - guestBIndex;
        }
    }
}

type CheckedConstraints = { satisfied: Constraint[], unsatisfied: Constraint[] };
function checkConstraints(guest: Guest, constraints: Constraint[]): CheckedConstraints {
    return constraints.reduce((acc, constraint) => {
        acc[constraint(guest) ? 'satisfied' : 'unsatisfied'].push(constraint);
        return acc;
    }, { satisfied: [], unsatisfied: [] } as CheckedConstraints)
}

function satisfyAllConstraints(constraints: Constraint[]) {
    constraints.forEach(c => c.satisfy());
}

export default function setupRooms(timeslots: number, rooms: Room[]) {
    const timetableTemplate: Timetable = rooms.map(r => ({ [r.id]: [] })).reduce((acc, e) => ({ ...acc, ...e }));
    return function setupGuests(guests: Guest[]) {
        return function setupConstraints(constraintInitializers: ConstraintInitializer[]) {
            function* generateSchedules(guestSorter?: GuestSorterHeuristic) {
                const constraints = constraintInitializers.map(ci => ci());
                const internalGuests: InternalGuest[] = guests.map(g => ({
                    ...g,
                    desiredRooms: g.desiredRooms.map(r => ({ ...r, assigned: 0 })),
                    assignedTimeslots: 0
                }));

                const internalGuestMap = internalGuests.map(g => ({ [g.id]: g })).reduce((acc, e) => ({ ...acc, ...e }));

                guestSorter = guestSorter || getDefaultGuestSorter(internalGuests);
                let currentTimetable: Timetable;
                for (let i = 0; i < timeslots; i++) {
                    const userInput: Timetable = JSON.parse(JSON.stringify(yield JSON.parse(JSON.stringify(currentTimetable!))));
                    currentTimetable = userInput || JSON.parse(JSON.stringify(timetableTemplate));
                    if (!userInput) {
                        const sortedGuests = [...internalGuests].sort(guestSorter);

                        for (const guest of sortedGuests) {
                            const { satisfied, unsatisfied } = checkConstraints(guest, constraints);
                            if (unsatisfied.length > 0) {
                                continue;
                            }

                            // step e
                            const availableDesiredRooms = guest.desiredRooms
                                // Exclude rooms for which the guest's preferences are satisfied
                                .filter((d: DesiredRoom) => d.assigned < d.max)
                                // Exclude rooms that are already fully occupied
                                .filter((d: DesiredRoom) => currentTimetable[d.id].length < rooms[d.id].max)
                                // Sort so that the least-satisfied preference comes first
                                .sort((a: DesiredRoom, b: DesiredRoom) => ((a.max - a.assigned) - (b.max - b.assigned)));

                            const assignedRoom = availableDesiredRooms[0];

                            currentTimetable[assignedRoom.id].push(guest.id);
                        }
                    }

                    for (const key in currentTimetable) {
                        const roomId = key as unknown as number;
                        for (const assignedGuestId of currentTimetable[roomId]) {
                            const guest = internalGuestMap[assignedGuestId];
                            const { satisfied } = checkConstraints(guest, constraints);
                            satisfyAllConstraints(satisfied);

                            guest.assignedTimeslots++;
                            guest.desiredRooms
                                .filter((d: DesiredRoom) => d.id == roomId)
                                .forEach((d: DesiredRoom) => d.assigned++);
                        }
                    }
                }
            }
            return function setupSorter(guestSorter?: GuestSorterHeuristic) {
                const scheduleGenerator = generateSchedules(guestSorter);
                scheduleGenerator.next();
                return function nextTimetable(nextTimetable?: Timetable): Timetable {
                    return (nextTimetable ?
                        scheduleGenerator.next(nextTimetable) :
                        scheduleGenerator.next()).value;
                }
            }
        }
    }
}