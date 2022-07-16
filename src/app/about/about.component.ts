import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {concat, fromEvent, interval, noop, observable, Observable, of, timer, merge, AsyncSubject} from 'rxjs';
import {delayWhen, filter, map, take, timeout} from 'rxjs/operators';
import {createHttpObservable} from '../common/util';


@Component({
    selector: 'about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

    ngOnInit() {
		const subject = new AsyncSubject();
		const series$ = subject.asObservable();

		series$.subscribe(val => console.log("First sub: ", val));

		subject.next(1);
		subject.next(2);
		subject.next(3); // even early subscribers will only get this value, and none of the intermediate values
		// subject.complete();

		setTimeout(() => {
			series$.subscribe(val => console.log("Second sub: ", val));
			subject.next(4);
		}, 3000);
    }


}






