/* global app:true */

'use strict';

var app = app || {};

app.Loginform = Backbone.Model.extend({
    url: function() {
        return 'http://localhost:3002/administrator/login'
    },
    defaults: {
        success: false,
        errors: [],
        errfor: {},
        username: '',
        password: ''
    }
});

app.LoginformView = Backbone.View.extend({
    el: '#form-section',
    events: {
    'submit form': 'preventSubmit',
    'keypress [name="password"]': 'loginOnEnter',
    'click .btn-login': 'login'
    },
    initialize: function() {
        this.model = new app.Loginform();
        this.template = _.template($('#tmpl-login').html());
        this.listenTo(this.model, 'sync', this.render);
        this.render();       
    },
    render: function() {
        this.$el.html(this.template( this.model.attributes ));
        return this;
    },
    preventSubmit: function(event) {
        event.preventDefault();
    },
    loginOnEnter: function(event) {
        if (event.keyCode !== 13) { return; }
        if ($(event.target).attr('name') !== 'password') { return; }
        event.preventDefault();
        this.login();
    },
    login: function() {
        this.model.save({
            username: this.$el.find('[name="username"]').val(),
            password: this.$el.find('[name="password"]').val()
        },{
            success: function(model, response) {
                if (response.success) {
                    location.href = '/administrator/';
                }
                else {
                    model.set(response);
                }
            }
        });
    }
});

$(document).ready(function() {
    app.loginformView = new app.LoginformView();
});