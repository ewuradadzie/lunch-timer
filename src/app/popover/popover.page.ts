import { Component, Input, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.page.html',
  styleUrls: ['./popover.page.scss'],
})

export class PopoverPage implements OnInit {

  @Input() schedule: any;
  start;
  slots;
  duration;
  interval;

  constructor(private storage: Storage, private pop: PopoverController) { }

  ngOnInit() {
    this.start = this.schedule.start;
    this.duration = this.schedule.duration;
    this.interval = this.schedule.interval;
    this.slots = this.schedule.numberOfSlots;
  }

  save() {
    const schedule = {
      start: this.start,
      duration: this.duration,
      interval: this.interval,
      numberOfSlots: this.slots
    };
    this.storage.set('schedule', schedule);
    this.pop.dismiss();
  }

}
