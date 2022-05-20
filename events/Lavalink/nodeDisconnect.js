module.exports = async (client, node, reason) => {

	console.log(`Node "${node.options.identifier}" disconnect because ${reason}.`);

}