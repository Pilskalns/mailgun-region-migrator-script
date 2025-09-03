const Progress = require("cli-progress");

async function migrateList(fromAddress, toAddress, regionA, regionB){
    console.log(`Fecthing members from region A: ${fromAddress}`);

    let members = await regionA.getMembers(fromAddress);

    try {
        let check = await regionB.getList(toAddress);
    } catch (error) {
        if(error.response?.status === 404) {
            console.log('List not found in region B, creating...');

            let info = await regionA.getList(fromAddress);
            await regionB.createList({...info.list, address: toAddress});
        }
    }

    const bar = new Progress.SingleBar({}, Progress.Presets.rect);

    console.log(`Uploading`,members.length,` members to region B: ${fromAddress}`);

    bar.start(members.length, 0);
    for (const member of members) {
        await regionB.updateMember(toAddress, member);
        bar.increment();
    }
    bar.stop();
}

module.exports.migrateList = migrateList;