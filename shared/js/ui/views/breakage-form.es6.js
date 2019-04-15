const Parent = window.DDG.base.View
const browserUIWrapper = require('./../base/$BROWSER-ui-wrapper.es6.js')

function BreakageForm (ops) {
    this.model = ops.model
    this.template = ops.template
    this.$root = window.$('.js-breakage-form')
    Parent.call(this, ops)

    this._setup()
}

BreakageForm.prototype = window.$.extend({},
    Parent.prototype,
    {
        _setup: function () {
            this._cacheElems('.js-breakage-form', [
                'close',
                'submit',
                'element',
                'message',
                'dropdown'
            ])
            this.bindEvents([
                [this.$close, 'click', this._closeForm],
                [this.$submit, 'click', this._submitForm],
                [this.$dropdown, 'change', this._selectCategory]
            ])
        },

        _openForm: function (e) {
            this.$el.removeClass('is-hidden')
        },

        _closeForm: function (e) {
            if (e) e.preventDefault()

            this.model.fetch({ firePixel: ['ept', 'off'] })
            this._reloadPage(300)
        },

        _submitForm: function (e) {
            if (e) e.preventDefault()
            if (this.$submit.hasClass('btn-disabled')) {
                return
            }

            let pixelParams = {}

            pixelParams.category = this.$dropdown.val()
            pixelParams.surrogates = []
            pixelParams.blockedTrackers = []
            pixelParams.siteUrl = encodeURIComponent(this.model.tab.url)
            pixelParams.upgradedHttps = this.model.tab.upgradedHttps.toString()
            const trackerObjects = this.model.tab.trackersBlocked

            for (let tracker in trackerObjects) {
                let trackerUrls = trackerObjects[tracker].urls
                Object.keys(trackerUrls).forEach((u) => {
                    if (trackerUrls[u].isBlocked) {
                        pixelParams.blockedTrackers.push(u)
                        if (trackerUrls[u].reason === 'surrogate') {
                            pixelParams.surrogates.push(u)
                        }
                    }
                })
            }

            this.model.fetch({ firePixel: ['ept',
                                           'off',
                                           {category: pixelParams.category},
                                           {url: pixelParams.siteUrl},
                                           {upgradedHttps: pixelParams.upgradedHttps},
                                           {blockedTrackers: pixelParams.blockedTrackers},
                                           {surrogates: pixelParams.surrogates}
                                          ]
                             })

            this.$element.addClass('is-hidden')
            this.$message.removeClass('is-hidden')
//            this._reloadPage(2000)
        },

        _selectCategory: function () {
            if (this.$dropdown.val()) {
                this.$submit.removeClass('btn-disabled')
            } else if (!this.$submit.hasClass('btn-disabled')) {
                this.$submit.addClass('btn-disabled')
            }
        },

        _reloadPage: function (delay) {
            setTimeout(() => {
                browserUIWrapper.closePopup()
                browserUIWrapper.reloadTab(this.model.tab.id)
                this.destroy()
            }, delay)
        }
    }
)

module.exports = BreakageForm
