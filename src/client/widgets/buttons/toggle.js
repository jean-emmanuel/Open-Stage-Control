var Widget = require('../common/widget'),
    doubletab = require('../mixins/double_tap'),
    html = require('nanohtml'),
    {deepEqual, isJSON} = require('../../utils')

class Toggle extends Widget {

    static description() {

        return 'On / off button.'

    }

    static defaults() {

        return super.defaults({


            _toggle: 'toggle',

            on: {type: '*', value: 1, help: [
                'Set to `null` to send send no argument in the osc message',
            ]},
            off: {type: '*', value: 0, help: [
                'Set to `null` to send send no argument in the osc message. Must be different from `on`.',
            ]},
            mode: {type: 'string', value: 'toggle', choices: ['toggle', 'push', 'tap'], help: [
                'Interraction mode:',
                '- `toggle` (classic on/off switch)',
                '- `push` (press & release)',
                '- `tap` (no release)'
            ]},
            doubleTap: {type: 'boolean', value: false, help: 'Set to `true` to make the button require a double tap to be pushed instead of a single tap'},
            colorTextOn: {type: 'string', value: 'auto', help: 'Defines the widget\'s accent color (css variable `--custom-color`). Must be a valid CSS color. Set to "auto" to inherit from parent widget.'},

        })

    }

    constructor(options) {

        super({...options, html: html`<inner></inner>`})

        this.state = 0
        this.active = false

        if (this.getProp('led')) this.container.classList.add('led')

        var tap = this.getProp('mode') === 'tap',
            push = this.getProp('mode') === 'push' || tap

        if (push) {

            if (this.getProp('doubleTap')) {

                doubletab(this.widget, ()=>{

                    this.active = true
                    this.setValue(this.getProp('on'), {sync: true, send: true})

                })

            } else {

                this.on('draginit',()=>{

                    if (this.active) return

                    this.active = true
                    this.setValue(this.getProp('on'), {sync: true, send: true})

                }, {element: this.widget})

            }

            this.on('dragend',()=>{

                if (!this.active) return

                this.active = false
                this.setValue(this.getProp('off'), {sync: true, send: !tap})

            }, {element: this.widget})

        } else {

            if (this.getProp('doubleTap')) {

                doubletab(this.widget, ()=>{


                    this.active = true
                    this.setValue(this.state ? this.getProp('off') : this.getProp('on'), {sync: true, send: true})

                })

            } else {

                this.on('draginit',()=>{

                    if (this.active) return

                    this.active = true
                    this.setValue(this.state ? this.getProp('off') : this.getProp('on'), {sync: true, send: true})

                }, {element: this.widget})

                this.on('dragend',()=>{

                    this.active = false

                }, {element: this.widget})

            }

        }


        this.value = this.getProp('off')

    }



    setValue(v, options={}) {

        if (typeof v === 'string' && isJSON(v)) {
            try {
                v = JSON.parse(v    )
            } catch (err) {}
        }

        var newstate

        if (deepEqual(v, this.getProp('on'))) {

            newstate = 1

        } else if (deepEqual(v, this.getProp('off'))) {

            newstate = 0

        }

        if (newstate !== undefined) {

            this.state = newstate
            this.container.classList.toggle('on', this.state)
            this.value = this.getProp(this.state ? 'on' : 'off')

            if (options.send) this.sendValue()
            if (options.sync) this.changed(options)

        }



    }

    onRemove() {

        if (this.active && this.getProp('mode') === 'push') this.setValue(this.getProp('off'), {sync: true, send: true})
        super.onRemove()

    }

}

Toggle.cssVariables = Toggle.prototype.constructor.cssVariables.concat(
    {js: 'colorTextOn', css: '--color-text-on'}
)

Toggle.dynamicProps = Toggle.prototype.constructor.dynamicProps.concat(
    'on',
    'off',
    'norelease'
)

module.exports = Toggle
