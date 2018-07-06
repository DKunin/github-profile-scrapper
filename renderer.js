const DATA = [];
const getList = require('./getList');

new Vue({
    el: '#app',
    mounted() {},
    methods: {
        checkActivity(item) {
            if (!item) {
                return '';
            }
            return new Date(item.created_at).toLocaleString();
        },
        updateUsers() {
            this.loadingStatus = 'Загрузка...';
            this.users = [];
            getList(
                `&q=language:${escape(this.language)}+location:${escape(
                    this.location
                )}`
            ).then(result => {
                this.users = result;
                this.loadingStatus = result.length ? 'Загружено' : 'Нет данных';
            });
        }
    },
    template: '#user',
    data: function() {
        return {
            users: DATA,
            location: null,
            language: null,
            loadingStatus: 'Нет данных'
        };
    },
    computed: {
        sorted() {
            return this.users;
            // .sort((a, b) => {
            //     return b.public_repos - a.public_repos;
            // })
            // .filter(({ lastActivity }) => lastActivity)
            // .filter(({ public_repos }) => public_repos >= 5)
            // .filter(({ followers }) => followers >= 0)
        }
    }
});
