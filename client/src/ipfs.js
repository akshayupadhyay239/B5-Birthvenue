const IPFSclient = require("ipfs-api");
const ipfs = IPFSclient({
  host:"ipfs.infura.io" , port:5001,protocol:"https"
});

export default ipfs;