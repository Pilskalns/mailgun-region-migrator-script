'use strict';
const axios = require('axios');
const { setupCache } = require('axios-cache-interceptor');
const cacheStorage = require('./cachestorage');

class Mailgun {
    constructor(config = {apikey: null, baseUrl: null, cache: false}){
        this.apikey = config.apikey;
        this.baseUrl = config.baseUrl;

        this.axios = axios.create({
            baseURL: this.baseUrl,
            auth: {
                username: 'api',
                password: this.apikey
            },
        })

        if(config.cache){
            const cacher = cacheStorage();
            setupCache(this.axios,{
                storage: cacher,
                ttl: 60 * 60 * 1000,
                interpretHeader: false, //important to cache and dont delete
                // debug: console.log
            });
        }
    }

    async createList(body){
        let response = await this.axios.post('/v3/lists', body, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            cache: false,
        });
        return response.data;
    }

    async getLists(){
        let response = await this.axios.get('/v3/lists');
        return response.data;
    }

    async getList(address){
        let response = await this.axios.get(`/v3/lists/${address}`);
        return response.data;
    }

    async getMembersPage(address, pageUrl = null, cache = true){
        let url = pageUrl || `/v3/lists/${address}/members/pages`;
        let response = await this.axios.get(url, {cache: cache});
        return response.data;
    }

    async getMembers(address, cache = true){

        let members = [];

        let page = await this.getMembersPage(address, null, cache);

        while(page.items.length > 0){
            members.push(...page.items)

            page = await this.getMembersPage(address, page.paging.next, cache);
        }

        return members;
    }

    async updateMember(address, member){
        let body = {
            address: member.address,
            name: member.name,
            vars: JSON.stringify(member.vars || {}),
            subscribed: member.subscribed,
            upsert: true
        }

        let response = await this.axios.post(`/v3/lists/${address}/members`, body, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            cache: false,
        });

        if(response.status !== 200){
            console.log(response.data);
            throw new Error('Failed to update member:', member.address);
        }

        return response.data;
    }

    async deleteMember(address, memberAddress) {
        let response = await this.axios.delete(`/v3/lists/${address}/members/${memberAddress}`, {
            cache: false,
        });

        if(![200, 404].includes(response.status)){
            console.log(response.data);
            throw new Error('Failed to delete member:', memberAddress);
        }

        return response.data;
    }
}

module.exports = Mailgun;