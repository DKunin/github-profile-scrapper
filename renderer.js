const DATA = [];
const getList = require('./getList');

new Vue({
    el: '#app',
    mounted() {},
    methods: {
        nextPage() {
            this.page = this.page + 1;
            this.updateUsers();
        },
        prevPage() {
            this.page = this.page - 1;
            this.updateUsers();
        },
        checkActivity(item) {
            if (!item) {
                return '';
            }
            return new Date(item.created_at).toLocaleString();
        },
        updateUsers() {
            this.loadingStatus = 'Загрузка...';
            this.users = [];
            const mainQuery = `q=language:${escape(
                this.language
            )}+location:${escape(this.location)}`;
            if (mainQuery !== this.prevQuery) {
                this.page = 1;
            }

            this.prevQuery = mainQuery;
            getList(`?page=${this.page}&${mainQuery}`).then(result => {
                this.users = result;
                this.loadingStatus = result.length ? 'Загружено' : 'Нет данных';
            });
        }
    },
    template: '#user',
    data: function() {
        return {
            users: DATA,
            page: 1,
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
