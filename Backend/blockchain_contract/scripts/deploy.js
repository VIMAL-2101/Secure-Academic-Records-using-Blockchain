const hre = require("hardhat");

async function main() {

  const AuditLog = await hre.ethers.getContractFactory("AuditLog");

  const contract = await AuditLog.deploy();

  await contract.waitForDeployment();

  console.log("AuditLog deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});