const DATA = [];
const getList = require('./getList');
const package = require('./package.json');

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
            this.totalCount = 0;
            this.users = [];
            let mainQuery = 'q=';
            if (this.language) {
                mainQuery = mainQuery + `language:${escape(this.language)}`;
            }
            if (this.language && this.location) {
                mainQuery = mainQuery + `+location:${escape(this.location)}`;
            } else if (!this.language && this.location) {
                mainQuery = mainQuery + `location:${escape(this.location)}`;
            }

            if (mainQuery !== this.prevQuery) {
                this.page = 1;
            }

            this.prevQuery = mainQuery;
            getList(`?page=${this.page}&${mainQuery}`).then(result => {
                this.totalCount = result.total_count;
                this.users = result.list;
                this.loadingStatus = result.length ? 'Загружено' : 'Нет данных';
            });
        }
    },
    template: '#user',
    data: function() {
        return {
            version: package.version,
            totalCount: 0,
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
