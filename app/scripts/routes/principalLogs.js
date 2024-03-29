App.PrincipalLogsRoute = App.MessagePagingRoute.extend({
    messagePageLimit: 50,

    baseUrl: function() {
        var base = "/#/principal/" + this.modelFor('principal').id  + "/logs";
        console.log(base);
        return base;
    }.property(),

    activate: function() {
        setTimeout(function() { $('#principalLogsTab').addClass('active'); }, 0);
    },

    deactivate: function() {
        setTimeout(function() { $('#principalLogsTab').removeClass('active'); }, 0);
    },

    filter: function() {
        var principal = this.modelFor("principal");

        return {
            $and: [
              { type: 'log' },
              {
                  $or: [
                      { to: principal.id },
                      { from: principal.id }
                  ]
              }
            ]
        };
    },

    model: function(params) {
        if (!params.sort)
            params.sort = 'ts';

        if (!params.skip)
            params.skip = 0;

        if (!params.direction)
            params.direction = -1;

        this.set('params', params);

        return this.query(params);
    },

    query: function(params) {

        var sort = {};
        sort[params.sort] = parseInt(params.direction);

        return App.Message.find(this.filter(), {
            skip: parseInt(this.get('params').skip),
            limit: parseInt(this.get('messagePageLimit')),
            sort: sort
        });
    },

    setupController: function(controller, model) {
        this._super(controller, model);

        this.controller.set('router', this);

        var self = this;
        this.subscription = App.session.onMessage(this.filter(), function(nitrogenMessage) {
            self.query(self.get('params')).then(function(messages) {
                self.controller.set('content', messages);
            });
        });
    },

    actions: {
        willTransition: function(transition) {
            if (this.subscription) {
                var session = App.get('session');

                if (session) session.disconnectSubscription(this.subscription);
                this.subscription = null;
            }
        }
    }

    /*,

    serialize: function() {
        var params = this.get('params');

        if (!params) {
            params = {
                skip: '0',
                sort: 'ts',
                direction: '1'
            }
        }

        return params;
    } */
});