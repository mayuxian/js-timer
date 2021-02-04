/**
 * 时间定时器
 * @desc 时间定时器
 * @param {function} tick - 定时触发事件
 * @param {int} interval -事件间隔 - 事件
 * @param {boolean} _isTimerStop -定时器是否停止
 */
export class Timer {
  constructor () {
    this._interval = 1000; //时间间隔，默认1s
    this._initInterval = 1000;//初始化设置的间隔
    this._tick; //定时器触发事件
    this._isTimerStop = false;//定时器是否停止事件
    this.timer = null;
    this._startTime = null
    this._tickCount = 0;
    this.missTickEnabled = true; //若延迟误差超过了间隔时间,则忽略miss掉中间,还是追加补偿tick
  }

  ///时间间隔(单位毫秒ms)，默认1s
  get interval() {
    return this._initInterval;
  }
  set interval(seconds) {
    this._interval = seconds;
    this._initInterval = seconds;
  }

  ///时间定时器定时执行函数
  get tick() {
    return this._tick();
  }
  set tick(func) {
    if (!this.checkFunction(func)) {
      throw new Error(`tick is not function.`);
    }
    this._tick = func;
  }

  get missTickEnabled() {
    return this._missTickEnabled;
  }
  set missTickEnabled(val) {
    this._missTickEnabled = !!val
  }
  // --------- public 方法------------
  start() {
    this._isTimerStop = false;
    this._startTime = new Date().getTime();

    clearTimeout(this.timer)
    this.startSetTimeout()
  }
  stop() {
    this._isTimerStop = true;
    this._tickCount = 0;
    clearTimeout(this.timer);
  }
  ///获取定时器是否停止状态
  get isTimerStop() {
    return this._isTimerStop;
  }

  //----------------- private 方法---------------------
  checkFunction(func) {
    return func && Object.prototype.toString.call(func) === '[object Function]'
  }

  startSetTimeout() {
    this.timer = setTimeout(() => {
      this.tickEvent();
    }, this._interval);
  }

  tickEvent() {
    if (!this.checkFunction(this._tick)) {
      this.stop();
      throw new Error(`tick:${this._tick},tick is not function.`);
    }
    if (!this._isTimerStop) {
      this._tickCount++
      this.offsetDiff();
      this.startSetTimeout();
      this._tick();
    }
  }
  offsetDiff() {
    let offset = new Date().getTime() - (this._startTime + this._tickCount * this._initInterval);
    console.log("误差：" + offset);
    const nextTime = this._initInterval - offset;
    if (nextTime < 0 && this._missTickEnabled) {
      //若小于0,表示误差大于间隔,已经错过了一次tick,若错过tick,则应该排除多余的tick做补偿
      this._interval = this._initInterval - Math.abs(nextTime) % this._initInterval

    } else {
      this._interval = nextTime >= 0 ? nextTime : 0;
    }
  }
};
