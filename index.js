require('dotenv').config({quiet: true});
const fs = require('fs');
const { program } = require('commander');
const Progress = require('cli-progress');
const Mailgun = require('./src/mailgun.js');
const {migrateList} = require("./src/migrate-list");
const storage = require("./src/cachestorage");

program
    .option('-a, --address <string>', 'mailing list address to migrate')
    .option('--all', 'migrate all lists from region A to region B')
    .option('--clear-cache', 'clear cache before running')
    .option('--compare', 'Compare two accounts')
    .parse();

const options = program.opts();

if(options.clearCache) {
    const storage = require('./src/cachestorage');
    (async () => {
        await storage().clear();
    })();
    console.log('Cache cleared!');
}

if(!fs.existsSync('.env')){
    fs.copyFileSync('.env.example', '.env');
}

if(!process.env.REGION_US_KEY || !process.env.REGION_EU_KEY) {
    console.error('\nMissing API_KEYs, check .env file \n');
    process.exit(1);
}


async function run() {
    let regionA = new Mailgun({
        apikey: process.env.REGION_US_KEY,
        baseUrl: process.env.REGION_US,
        cache: true,
    });

    let regionB = new Mailgun({
        apikey: process.env.REGION_EU_KEY,
        baseUrl: process.env.REGION_EU,
    });

    // implementation for single list migration
    if(options.address){
        console.log('Fetching list info for:', options.address);

        try {
            await migrateList(options.address, options.address, regionA, regionB);
        } catch(err) {
            console.log(err.message, err.response?.data);
        }
        return;
    }

    // implementation for ALL lists migration
    if(options.all){
        console.log('Fetching ALL lists');

        try {
            let all = await regionA.getLists();
            console.log(`Found ${all.items.length} lists on region A`);

            for(const list of all.items){
                console.log(`\nMigrating list:`, list.address);

                await migrateList(list.address, list.address, regionA, regionB);
            }
        } catch(err) {
            console.log(err.message, err.response?.data);
        }
        return;
    }

    // make a nice table to compare two accounts
    if(options.compare){
        let allA = await regionA.getLists();
        let allB = await regionB.getLists();

        let allLists = [
            ...allA.items.map(item => item.address),
            ...allB.items.map(item => item.address),
        ];
        allLists = [...new Set(allLists)];

        allLists = allLists.map(list => {
            let countA = allA.items.find(a => a.address === list)?.members_count ?? 'x';
            let countB = allB.items.find(a => a.address === list)?.members_count ?? 'x';

           return {
               list: list,
               'Region A': countA,
               'Region B': countB,
               'Match': (countA === countB),
           }
        });

        console.table(allLists);

        return;
    }

    console.error('\nNo action chosen, check --help\n');
    program.help();
    process.exit(1);
}

run().catch(error => console.log(error))