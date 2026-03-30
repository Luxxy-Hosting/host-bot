module.exports = async (client, node, error) => {

	console.log(`Node "${node.options.uuid_short}" encountered an error: ${error.message}.`);

}