import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { map, tap } from "rxjs/operators";
import { Course } from "../model/course";
import { createHttpObservable } from "./util";

/**
 * Configure the service so that we can easily inject into
 * other services and components. The providedIn: 'root' allows
 * us to do this, and also ensures that this is a singleton.
 */
@Injectable({
	providedIn: 'root'
})
export class Store {
	/* Only this class can emit new values for the Observable. */
	private subject = new BehaviorSubject<Course[]>([]);
	courses$: Observable<Course[]> = this.subject.asObservable();

	init() {
		const http$ = createHttpObservable('/api/courses');

        http$
            .pipe(
                tap(() => console.log("HTTP request executed")),
                map(res => Object.values(res["payload"]) ),
            )
			.subscribe(
				courses => this.subject.next(courses)
			);
	}

	selectBeginnerCourses() {
		return this.filterByCategory('BEGINNER');
	}

	selectAdvancedCourses() {
		return this.filterByCategory('ADVANCED');
	}

	filterByCategory(category: string) {
		return this.courses$
			.pipe(
				map(courses => courses
						.filter(course => course.category == category))
			);
	}
	
	saveCourse(courseId: number, changes): Observable<any> {
		const courses = this.subject.getValue();
		const courseIndex = courses.findIndex(course => course.id == courseId);

		/* Create a new copy of the array. */
		const newCourses = courses.slice(0);

		/* Modify the in-memory data in the store. Change only the course that is being modified. */
		newCourses[courseIndex] = {
			...courses[courseIndex],
			...changes
		};

		this.subject.next(newCourses);

		/* Make a request to the backend. */
		return fromPromise(fetch(`/api/courses/${courseId}`, {
			method: 'PUT',
			body: JSON.stringify(changes),
			headers: {
				'content-type': 'application/json' /* needed for our server to recognize this is a JSON payload. */
			}
		}));
	}
}