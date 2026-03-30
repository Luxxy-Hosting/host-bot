module.exports = async (client, node, reason) => {

	console.log(`Node "${node.options.uuid_short}" disconnect because ${reason}.`);

}