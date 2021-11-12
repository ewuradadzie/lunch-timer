import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { PopoverController } from '@ionic/angular';
import { PopoverPage } from '../popover/popover.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  time = new Date();
  currentTime: string;
  currentTimeInSecs: number;
  amOrPm;

  slots = [];
  currentTimeSlot;

  friendlyTimeSlot = {
    start: null,
    end: null
  };

  schedule = {
    start: '',
    duration: 0,
    interval: 0,
    numberOfSlots: 0
  };

  defaultSchedule = {
    start: '11:30',
    duration: 35,
    interval: 5,
    numberOfSlots: 6
  };

  threshold: number;
  warning: boolean;
  countdown = 0;
  countdownBlink = false;

  // tick = new Audio('assets/morse.mp3');

  color = '#000';
  transitions = [
    '#238823',
    '#F7D307',
    '#FFBF00',
    '#FF8800',
    '#D2222D'
  ];

  constructor(private storage: Storage, public pop: PopoverController) {
    setInterval(() => {
      this.getCurrentTime();
      this.getCurrentTimeSlot();
      this.formatSlot();
      this.checkCondition();
    }, 1000);
  }

  async ngOnInit() {
    await this.setupStorage();
    this.generateTimeSlots(this.schedule);
  }

  // Fetches saved schedule
  async setupStorage() {
    this.currentTimeSlot = null;
    this.slots = [];
    await this.storage.create();
    const savedSchedule = await this.storage.get('schedule');
    if (savedSchedule) {
      this.schedule = savedSchedule;
    } else {
      await this.storage.set('schedule', this.defaultSchedule);
      this.schedule = this.defaultSchedule;
    }
  }

  // Formats current time
  getCurrentTime() {
    this.time = new Date();
    let h = this.time.getHours().toString().length < 2 ? `0${this.time.getHours()}` : this.time.getHours();;
    const m = this.time.getMinutes().toString().length < 2 ? `0${this.time.getMinutes()}` : this.time.getMinutes();
    const s = this.time.getSeconds().toString().length < 2 ? `0${this.time.getSeconds()}` : this.time.getSeconds();
    this.currentTimeInSecs = +h * 3600 + +m * 60 + +s;

    this.amOrPm = h >= 12 ? 'pm' : 'am';
    h = (+h % 12) || 12;
    this.currentTime = `${h}:${m}`;
  }

  // Gets current time slot
  getCurrentTimeSlot() {
    for (const i of this.slots) {
      // console.log(i.end);
      const start = i.start;
      const end = i.end;
      if (start <= this.currentTimeInSecs && this.currentTimeInSecs <= end) {
        this.currentTimeSlot = i;
      } else if (end <= this.currentTimeInSecs) {
        this.currentTimeSlot = null;
      }
    }
    return this.currentTimeSlot;
  }

  // Generates time slots
  generateTimeSlots(schedule) {
    let start = +schedule.start.split(':')[0] * 3600 + +schedule.start.split(':')[1] * 60;
    const duration = +schedule.duration * 60;
    const interval = +schedule.interval * 60;

    for (let i = 0; i < schedule.numberOfSlots; i++) {
      const end = start + duration;
      this.slots.push({ start, end });
      start = end + interval;
    };
    console.log('generate time slots', this.slots);
    return this.slots;
  }

  // Friendly formatting for time slot
  formatSlot() {
    if (this.currentTimeSlot) {
      let hour = Math.floor(+this.currentTimeSlot.start / 3600);
      let min: any = (+this.currentTimeSlot.start % 3600) / 60;
      min = min.toString().length < 2 ? `0${min}` : min;

      let amOrPm = hour >= 12 ? 'pm' : 'am';
      hour = (hour % 12) || 12;

      this.friendlyTimeSlot.start = `${hour}:${min}${amOrPm}`;

      hour = Math.floor(+this.currentTimeSlot.end / 3600);
      min = (+this.currentTimeSlot.end % 3600) / 60;
      min = min.toString().length < 2 ? `0${min}` : min;

      amOrPm = hour >= 12 ? 'pm' : 'am';
      hour = (hour % 12) || 12;
      this.friendlyTimeSlot.end = `${hour}:${min}${amOrPm}`;

      this.threshold = +this.currentTimeSlot.end - 300;
    }
  }

  // Checks starting condtion for countdown
  checkCondition() {
    if (this.threshold <= this.currentTimeInSecs && this.currentTimeInSecs <= this.currentTimeSlot.end) {
      this.warning = true;
      this.countdown = this.currentTimeSlot.end - this.currentTimeInSecs;

      if (this.countdown <= 300 && this.countdown >= 240) {
        this.color = this.transitions[0];
      } else if (this.countdown < 240 && this.countdown >= 180) {
        this.color = this.transitions[1];
      } else if (this.countdown < 180 && this.countdown >= 120) {
        this.color = this.transitions[2];
      } else if (this.countdown < 120 && this.countdown >= 60) {
        this.color = this.transitions[3];
      } else if (this.countdown < 60 && this.countdown >= 0) {
        this.color = this.transitions[4];
      } this.countdownBlink = this.countdown < 30;
    } else {
      this.warning = false;
      this.countdown = 0;
    }
  }

  // Opens popover for setting a new schedule
  async openPopover(ev: any) {
    const popover = await this.pop.create({
      component: PopoverPage,
      componentProps: { schedule: this.schedule },
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    popover.onWillDismiss().then(async () => {
      await this.setupStorage().then(() => {
        this.generateTimeSlots(this.schedule);
      });
    });
    await popover.present();

  }
}
