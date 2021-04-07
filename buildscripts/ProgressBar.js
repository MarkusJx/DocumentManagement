/**
 * Source: https://medium.com/@bargord11/write-your-first-node-js-terminal-progress-bar-5bd5edb8a563
 */
class ProgressBar {
    constructor() {
        this.activate = typeof process.stdout.clearLine == "function";
        this.total = -1;
        this.current = -1;
        this.bar_length = process.stdout.columns - 30;
    }

    init(total) {
        this.total = total;
        this.current = 0;
        this.update(this.current);
    }

    update(current) {
        if (!this.activate) return;
        this.current = current;
        const current_progress = this.current / this.total;
        this.draw(current_progress);
    }

    draw(current_progress) {
        if (!this.activate) return;
        const filled_bar_length = (current_progress * this.bar_length).toFixed(0);
        const empty_bar_length = this.bar_length - filled_bar_length;

        const filled_bar = this.get_bar(filled_bar_length, "█", a => `\x1b[37m${a}\x1b[0m`);
        const empty_bar = this.get_bar(empty_bar_length, "░", a => `\x1b[37m${a}\x1b[0m`);
        const percentage_progress = (current_progress * 100).toFixed(2);

        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(
            `\x1b[35mProgress:\x1b[0m |${filled_bar}${empty_bar}| ${percentage_progress}%`
        );
    }

    get_bar(length, char, color = a => a) {
        let str = "";
        for (let i = 0; i < length; i++) {
            str += char;
        }
        return color(str);
    }
}

module.exports.ProgressBar = ProgressBar;