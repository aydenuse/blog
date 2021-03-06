'use strict';

const EventEmitter = require('events')

class ConcurrentExecutor {
    constructor(concurrency) {
        this.done = 0;
        this.pool = [];
        this.working = 0;
        this.concurrency = concurrency;
        this.event = new EventEmitter();
        this.event.on('done', () => {
            this.printf();
            this.done++;
            this.working--;
            this.run()
        })
    }

    async run() {
        if (this.working === this.concurrency) {
            return;
        }
        if (this.pool.length) {
            const job = this.pool.shift();
            this.working++;
            await job();
            // 触发完成事件
            this.event.emit('done');
        }
    }

    add(job) {
        this.pool.push(job);
        this.run();
    }

    printf() {
        console.log(`当前任务池:${this.pool.length}, 最大并发数:${this.concurrency}, 运行中:${this.working}, 已完成:${this.done}`);
    }

}

const concurrentExecutor = new ConcurrentExecutor(5)

const reqMock = () => new Promise(res =>
    setTimeout(() => res(), Math.random().toFixed(3) * 3000, res))

// for (let i = 0; i < 100; i++) {
//     concurrentExecutor.add(reqMock);
// }

setInterval(() => {
    concurrentExecutor.add(reqMock);
}, 200)