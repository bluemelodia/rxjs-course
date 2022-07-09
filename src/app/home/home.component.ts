import { Component, OnInit } from '@angular/core';
import { noop, Observable, of, throwError, timer } from 'rxjs';
import { catchError, delayWhen, finalize, map, retryWhen, shareReplay } from 'rxjs/operators';
import { LESSONS } from '../../../server/db-data';

import { createHttpObservable } from '../common/util';
import { Course } from "../model/course";

@Component({
	selector: 'home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	beginnerCourses$: Observable<Course[]>;
	advancedCourses$: Observable<Course[]>;

	constructor() {

	}

	ngOnInit() {
		const http$ = createHttpObservable('/api/courses');
		const courses$: Observable<Course[]> = http$
			.pipe(
				map(res => Object.values(res['payload'])),
				shareReplay(),
				retryWhen(errors => errors.pipe(
					delayWhen(() => timer(2000))
				))
			);

		this.beginnerCourses$ = courses$
			.pipe(
				map(courses => courses.filter(course => course.category === 'BEGINNER'))
			);

		this.advancedCourses$ = courses$
			.pipe(
				map(courses => courses.filter(course => course.category === 'ADVANCED'))
			);
	}

}
