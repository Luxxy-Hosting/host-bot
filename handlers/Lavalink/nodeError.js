module.exports = async (client, node, error) => {

	console.log(`Node "${node.options.identifier}" encountered an error: ${error.message}.`);

}