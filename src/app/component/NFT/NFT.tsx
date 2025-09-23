// "use client";

// import { useState, useEffect } from "react";
// import { ethers } from "ethers";

// const CONTRACT_ADDRESS = "0xa44f414a127e1a0b006b88d9d7d28fa54938b922";
// const CONTRACT_ABI = [
//   "function purchaseNFT() external payable",
//   "function price() external view returns (uint256)",
//   "function tokenCounter() external view returns (uint256)",
//   "function name() external view returns (string)",
//   "function symbol() external view returns (string)",
// ];

// interface NFTInfo {
//   price: string;
//   tokenCounter: number;
//   name: string;
//   symbol: string;
// }

// interface NFTComponentProps {
//   userAddress: string | null;
// }

// const NFTComponent = ({ userAddress }: NFTComponentProps) => {
//   const [nftInfo, setNftInfo] = useState<NFTInfo | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [status, setStatus] = useState<string>("");

//   const fetchNFTInfo = async () => {
//     if (!userAddress) {
//       setNftInfo(null);
//       return;
//     }

//     try {
//       const qsafeProvider = window.qsafe?.providers?.ethereum;
//       if (!qsafeProvider) {
//         throw new Error("QSafe provider not found");
//       }

//       const provider = new ethers.BrowserProvider(qsafeProvider);
//       const contract = new ethers.Contract(
//         CONTRACT_ADDRESS,
//         CONTRACT_ABI,
//         provider
//       );

//       const [price, tokenCounter, name, symbol] = await Promise.all([
//         contract.price(),
//         contract.tokenCounter(),
//         contract.name(),
//         contract.symbol(),
//       ]);

//       setNftInfo({
//         price: ethers.formatEther(price),
//         tokenCounter: Number(tokenCounter),
//         name,
//         symbol,
//       });
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setError("Failed to fetch NFT information");
//     }
//   };

//   useEffect(() => {
//     fetchNFTInfo();
//   }, [userAddress]);

//   // QSafe-specific transaction handling for NFT purchase
//   const purchaseNFT = async () => {
//     if (!window.qsafe?.providers?.ethereum || !userAddress) {
//       throw new Error("QSafe wallet not connected");
//     }

//     if (!nftInfo) {
//       throw new Error("NFT information not available");
//     }

//     const qsafeProvider = window.qsafe.providers.ethereum;
//     const contractInterface = new ethers.Interface(CONTRACT_ABI);

//     // 1. Encode function data
//     const data = contractInterface.encodeFunctionData("purchaseNFT");

//     // 2. Get gas price
//     let gasPrice: string;
//     try {
//       const gasPriceResponse = await fetch(
//         "https://tqrn-node1.quranium.org/node",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             jsonrpc: "2.0",
//             method: "eth_gasPrice",
//             params: [],
//             id: 1,
//           }),
//         }
//       );

//       const gasPriceResult = await gasPriceResponse.json();
//       if (gasPriceResult.error) {
//         throw new Error(
//           `Failed to fetch gas price: ${gasPriceResult.error.message}`
//         );
//       }
//       gasPrice = gasPriceResult.result;
//     } catch (error: any) {
//       console.warn("Failed to fetch gas price:", error.message);
//       gasPrice = "0x3b9aca00"; // 1 gwei default
//     }

//     // 3. Estimate gas
//     let gasLimit: string;
//     try {
//       const value = ethers.parseEther(nftInfo.price);

//       const estimateResponse = await fetch(
//         "https://tqrn-node1.quranium.org/node",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             jsonrpc: "2.0",
//             method: "eth_estimateGas",
//             params: [
//               {
//                 from: userAddress,
//                 to: CONTRACT_ADDRESS,
//                 data,
//                 value: "0x" + value.toString(16),
//               },
//             ],
//             id: 1,
//           }),
//         }
//       );

//       const estimateResult = await estimateResponse.json();
//       if (estimateResult.error) {
//         throw new Error(
//           `Gas estimation failed: ${estimateResult.error.message}`
//         );
//       }

//       // Add 20% buffer
//       const estimatedGas = BigInt(estimateResult.result);
//       const gasWithBuffer = (estimatedGas * BigInt(120)) / BigInt(100);
//       gasLimit = "0x" + gasWithBuffer.toString(16);
//     } catch (gasError: any) {
//       console.warn("Gas estimation failed:", gasError.message);
//       gasLimit = "0x2dc6c0"; // Default 3,000,000 gas
//     }

//     // 4. Build transaction
//     const value = ethers.parseEther(nftInfo.price);
//     const transaction = {
//       from: userAddress,
//       to: CONTRACT_ADDRESS,
//       data,
//       value: "0x" + value.toString(16),
//       gas: gasLimit,
//       gasPrice,
//     };

//     // 5. Send transaction
//     try {
//       setLoading(true);
//       setStatus("Processing transaction...");

//       const txHash = await qsafeProvider.request({
//         method: "eth_sendTransaction",
//         params: [transaction],
//       });

//       // 6. Poll for receipt
//       const maxAttempts = 30;
//       const pollInterval = 2000;
//       for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//         try {
//           const receiptResponse = await fetch(
//             "https://tqrn-node1.quranium.org/node",
//             {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 jsonrpc: "2.0",
//                 method: "eth_getTransactionReceipt",
//                 params: [txHash],
//                 id: 1,
//               }),
//             }
//           );

//           const receiptResult = await receiptResponse.json();
//           if (receiptResult.error) {
//             console.warn(
//               `Attempt ${attempt}: Failed to fetch receipt: ${receiptResult.error.message}`
//             );
//             continue;
//           }

//           const txReceipt = receiptResult.result;
//           if (txReceipt && txReceipt.blockNumber) {
//             if (txReceipt.status !== "0x1") {
//               throw new Error("Transaction failed");
//             }

//             setStatus("NFT purchased successfully!");
//             // Refresh NFT info
//             await fetchNFTInfo();
//             return txHash;
//           }
//           await new Promise((resolve) => setTimeout(resolve, pollInterval));
//         } catch (error: any) {
//           console.warn(
//             `Attempt ${attempt}: Error fetching receipt: ${error.message}`
//           );
//         }
//       }

//       throw new Error("Transaction receipt not found after maximum attempts");
//     } catch (err: any) {
//       console.error("NFT purchase error:", err);
//       setError(`NFT purchase failed: ${err.message || "Unknown error"}`);
//       setStatus("");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-4">
//       {/* Header */}
//       <header className="max-w-6xl mx-auto py-4 flex flex-col md:flex-row justify-between items-center">
//         <h1 className="text-2xl font-bold text-indigo-300 mb-4 md:mb-0">
//           NFT Marketplace
//           <span className="block text-sm text-indigo-200 mt-1">
//             Purchase unique digital collectibles
//           </span>
//         </h1>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-2xl mx-auto mt-8">
//         <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30 shadow-2xl shadow-indigo-900/30">
//           <div className="text-center mb-8">
//             <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
//               NFT Collection
//             </h2>
//             <p className="text-indigo-200">
//               Purchase exclusive NFTs from our collection
//             </p>
//           </div>

//           {/* NFT Information */}
//           {nftInfo && (
//             <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-indigo-500/30">
//               <h2 className="text-xl font-semibold mb-4 text-indigo-200">
//                 Collection Details
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="p-3 bg-gray-800/50 rounded-lg">
//                   <p className="text-indigo-200">Collection Name:</p>
//                   <p className="font-bold text-lg">{nftInfo.name}</p>
//                 </div>
//                 <div className="p-3 bg-gray-800/50 rounded-lg">
//                   <p className="text-indigo-200">Symbol:</p>
//                   <p className="font-bold text-lg">{nftInfo.symbol}</p>
//                 </div>
//                 <div className="p-3 bg-gray-800/50 rounded-lg">
//                   <p className="text-indigo-200">Price per NFT:</p>
//                   <p className="font-bold text-lg text-green-400">
//                     {nftInfo.price} ETH
//                   </p>
//                 </div>
//                 <div className="p-3 bg-gray-800/50 rounded-lg">
//                   <p className="text-indigo-200">Total Minted:</p>
//                   <p className="font-bold text-lg">{nftInfo.tokenCounter}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Purchase Button */}
//           <div className="mb-6 flex justify-center">
//             <button
//               onClick={purchaseNFT}
//               disabled={loading || !userAddress || !nftInfo}
//               className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading
//                 ? "Processing..."
//                 : `Purchase NFT for ${nftInfo?.price || "0"} ETH`}
//             </button>
//           </div>

//           {/* Status Display */}
//           {status && (
//             <div className="mt-4 p-3 bg-green-900/50 text-green-200 rounded-lg border border-green-700">
//               {status}
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
//             <button
//               onClick={fetchNFTInfo}
//               disabled={loading}
//               className="px-6 py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Refresh Data
//             </button>
//           </div>

//           {/* Error Display */}
//           {error && (
//             <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg border border-red-700">
//               {error}
//             </div>
//           )}
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="max-w-6xl mx-auto mt-8 py-4 text-center text-indigo-300">
//         <p>
//           © {new Date().getFullYear()} NFT Marketplace. All rights reserved.
//         </p>
//       </footer>
//     </div>
//   );
// };

// export default NFTComponent;
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

// const CONTRACT_ADDRESS = "0xfeef6a37709244a971806ce06fc3acefd07577e2";
const CONTRACT_ADDRESS = "0xa573e71d56a53a12da8e8509fa49488f9ecb63e6";
const CONTRACT_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function nextTokenId() external view returns (uint256)",
  "function mintOrUpdateReferral() external",
  "function uri(uint256) external view returns (string)",
  "function getReferralCount(uint256) external view returns (uint256)",
  "function getUserTokenId(address) external view returns (uint256)",
  "function getUserReferralCount(address) external view returns (uint256)",
];

interface CollectionInfo {
  name: string;
  symbol: string;
  totalMinted: number;
}

interface UserNFTInfo {
  tokenId: number;
  referralCount: number;
  metadata?: {
    name: string;
    description: string;
    image: string;
  };
}

interface NFTComponentProps {
  userAddress: string | null;
}

const NFTComponent = ({ userAddress }: NFTComponentProps) => {
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(
    null
  );
  const [userNFTInfo, setUserNFTInfo] = useState<UserNFTInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [checkAddress, setCheckAddress] = useState<string>("");
  const [checkedUserInfo, setCheckedUserInfo] = useState<UserNFTInfo | null>(
    null
  );

  const fetchCollectionInfo = async (contract: ethers.Contract) => {
    const [name, symbol, nextTokenId] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.nextTokenId(),
    ]);

    setCollectionInfo({
      name,
      symbol,
      totalMinted: Number(nextTokenId) - 1,
    });
  };

  const fetchUserNFTInfo = async (
    contract: ethers.Contract,
    address: string
  ) => {
    const [tokenId, referralCount] = await Promise.all([
      contract.getUserTokenId(address),
      contract.getUserReferralCount(address),
    ]);

    const parsedTokenId = Number(tokenId);
    const parsedReferralCount = Number(referralCount);

    let metadata;
    if (parsedTokenId > 0) {
      const uri = await contract.uri(tokenId);
      // Parse data URI: data:application/json;base64,BASE64JSON
      const base64Json = uri.split("data:application/json;base64,")[1];
      if (base64Json) {
        const jsonString = atob(base64Json);
        metadata = JSON.parse(jsonString);
      }
    }

    const info: UserNFTInfo = {
      tokenId: parsedTokenId,
      referralCount: parsedReferralCount,
      metadata,
    };

    return info;
  };

  const fetchAllInfo = async () => {
    if (!userAddress) {
      setCollectionInfo(null);
      setUserNFTInfo(null);
      return;
    }

    try {
      const qsafeProvider = window.qsafe?.providers?.ethereum;
      if (!qsafeProvider) {
        throw new Error("QSafe provider not found");
      }

      const provider = new ethers.BrowserProvider(qsafeProvider);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      await fetchCollectionInfo(contract);
      const userInfo = await fetchUserNFTInfo(contract, userAddress);
      setUserNFTInfo(userInfo);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch information");
    }
  };

  useEffect(() => {
    fetchAllInfo();
  }, [userAddress]);

  // QSafe-specific transaction handling for mint or update
  const mintOrUpdate = async () => {
    if (!window.qsafe?.providers?.ethereum || !userAddress) {
      throw new Error("QSafe wallet not connected");
    }

    const qsafeProvider = window.qsafe.providers.ethereum;
    const contractInterface = new ethers.Interface(CONTRACT_ABI);

    // 1. Encode function data
    const data = contractInterface.encodeFunctionData("mintOrUpdateReferral");

    // 2. Get gas price
    let gasPrice: string;
    try {
      const gasPriceResponse = await fetch(
        "https://tqrn-node1.quranium.org/node",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_gasPrice",
            params: [],
            id: 1,
          }),
        }
      );

      const gasPriceResult = await gasPriceResponse.json();
      if (gasPriceResult.error) {
        throw new Error(
          `Failed to fetch gas price: ${gasPriceResult.error.message}`
        );
      }
      gasPrice = gasPriceResult.result;
    } catch (error: any) {
      console.warn("Failed to fetch gas price:", error.message);
      gasPrice = "0x3b9aca00"; // 1 gwei default
    }

    // 3. Estimate gas
    let gasLimit: string;
    try {
      const estimateResponse = await fetch(
        "https://tqrn-node1.quranium.org/node",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_estimateGas",
            params: [
              {
                from: userAddress,
                to: CONTRACT_ADDRESS,
                data,
                value: "0x0",
              },
            ],
            id: 1,
          }),
        }
      );

      const estimateResult = await estimateResponse.json();
      if (estimateResult.error) {
        throw new Error(
          `Gas estimation failed: ${estimateResult.error.message}`
        );
      }

      // Add 20% buffer
      const estimatedGas = BigInt(estimateResult.result);
      const gasWithBuffer = (estimatedGas * BigInt(120)) / BigInt(100);
      gasLimit = "0x" + gasWithBuffer.toString(16);
    } catch (gasError: any) {
      console.warn("Gas estimation failed:", gasError.message);
      gasLimit = "0x2dc6c0"; // Default 3,000,000 gas
    }

    // 4. Build transaction
    const transaction = {
      from: userAddress,
      to: CONTRACT_ADDRESS,
      data,
      value: "0x0",
      gas: gasLimit,
      gasPrice,
    };

    // 5. Send transaction
    try {
      setLoading(true);
      setStatus("Processing transaction...");

      const txHash = await qsafeProvider.request({
        method: "eth_sendTransaction",
        params: [transaction],
      });

      // 6. Poll for receipt
      const maxAttempts = 30;
      const pollInterval = 2000;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const receiptResponse = await fetch(
            "https://tqrn-node1.quranium.org/node",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getTransactionReceipt",
                params: [txHash],
                id: 1,
              }),
            }
          );

          const receiptResult = await receiptResponse.json();
          if (receiptResult.error) {
            console.warn(
              `Attempt ${attempt}: Failed to fetch receipt: ${receiptResult.error.message}`
            );
            continue;
          }

          const txReceipt = receiptResult.result;
          if (txReceipt && txReceipt.blockNumber) {
            if (txReceipt.status !== "0x1") {
              throw new Error("Transaction failed");
            }

            setStatus("Operation successful!");
            // Refresh info
            await fetchAllInfo();
            return txHash;
          }
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
        } catch (error: any) {
          console.warn(
            `Attempt ${attempt}: Error fetching receipt: ${error.message}`
          );
        }
      }

      throw new Error("Transaction receipt not found after maximum attempts");
    } catch (err: any) {
      console.error("Operation error:", err);
      setError(`Operation failed: ${err.message || "Unknown error"}`);
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const checkOtherUser = async () => {
    if (!checkAddress || !ethers.isAddress(checkAddress)) {
      setError("Invalid address");
      return;
    }

    try {
      const qsafeProvider = window.qsafe?.providers?.ethereum;
      if (!qsafeProvider) {
        throw new Error("QSafe provider not found");
      }

      const provider = new ethers.BrowserProvider(qsafeProvider);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const info = await fetchUserNFTInfo(contract, checkAddress);
      setCheckedUserInfo(info);
    } catch (err) {
      console.error("Check error:", err);
      setError("Failed to fetch user information");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto py-4 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-300 mb-4 md:mb-0">
          Quranium IPhone NFT
          <span className="block text-sm text-indigo-200 mt-1">
            Mint and update your referral badge
          </span>
        </h1>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto mt-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30 shadow-2xl shadow-indigo-900/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              NFT Collection
            </h2>
            <p className="text-indigo-200">
              Free minting with dynamic referral updates
            </p>
          </div>

          {/* Collection Information */}
          {collectionInfo && (
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-indigo-500/30">
              <h2 className="text-xl font-semibold mb-4 text-indigo-200">
                Collection Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-indigo-200">Collection Name:</p>
                  <p className="font-bold text-lg">{collectionInfo.name}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-indigo-200">Symbol:</p>
                  <p className="font-bold text-lg">{collectionInfo.symbol}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-indigo-200">Total Minted:</p>
                  <p className="font-bold text-lg">
                    {collectionInfo.totalMinted}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User NFT Information */}
          {userNFTInfo && (
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-indigo-500/30">
              <h2 className="text-xl font-semibold mb-4 text-indigo-200">
                Your NFT Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-indigo-200">Token ID:</p>
                  <p className="font-bold text-lg">
                    {userNFTInfo.tokenId || "None"}
                  </p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-indigo-200">Referral Count:</p>
                  <p className="font-bold text-lg">
                    {userNFTInfo.referralCount}
                  </p>
                </div>
              </div>
              {userNFTInfo.metadata && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-indigo-200">
                    Metadata
                  </h3>
                  <p className="text-indigo-200">
                    Name: {userNFTInfo.metadata.name}
                  </p>
                  <p className="text-indigo-200">
                    Description: {userNFTInfo.metadata.description}
                  </p>
                  <img
                    src={userNFTInfo.metadata.image}
                    alt="NFT Image"
                    className="mt-2 rounded-lg max-w-full h-auto"
                  />
                </div>
              )}
            </div>
          )}

          {/* Mint/Update Button */}
          <div className="mb-6 flex justify-center">
            <button
              onClick={mintOrUpdate}
              disabled={loading || !userAddress}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : userNFTInfo?.tokenId > 0
                ? "Update Referral"
                : "Mint NFT"}
            </button>
          </div>

          {/* Check Other User */}
          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-indigo-500/30">
            <h2 className="text-xl font-semibold mb-4 text-indigo-200">
              Check Other User
            </h2>
            <input
              type="text"
              value={checkAddress}
              onChange={(e) => setCheckAddress(e.target.value)}
              placeholder="Enter address"
              className="w-full p-2 mb-2 bg-gray-800 text-white rounded"
            />
            <button
              onClick={checkOtherUser}
              disabled={loading}
              className="px-6 py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Check
            </button>
            {checkedUserInfo && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-indigo-200">Token ID:</p>
                  <p className="font-bold text-lg">
                    {checkedUserInfo.tokenId || "None"}
                  </p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-indigo-200">Referral Count:</p>
                  <p className="font-bold text-lg">
                    {checkedUserInfo.referralCount}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Display */}
          {status && (
            <div className="mt-4 p-3 bg-green-900/50 text-green-200 rounded-lg border border-green-700">
              {status}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={fetchAllInfo}
              disabled={loading}
              className="px-6 py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh Data
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg border border-red-700">
              {error}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-8 py-4 text-center text-indigo-300">
        <p>
          © {new Date().getFullYear()} Quranium IPhone NFT. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default NFTComponent;
