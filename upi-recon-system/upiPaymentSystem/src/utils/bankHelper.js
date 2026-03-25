import axios from "axios";

/**
 * Resolves the bankId for a given account by querying the Mock Bank API directly.
 * Uses the /account-details endpoint which returns the exact bankId tied to the account.
 * Falls back to IFSC prefix matching if accountNumber lookup fails.
 *
 * @param {string} accountNumber - The bank account number.
 * @param {string} ifsc - The IFSC code (fallback).
 * @returns {Promise<string|null>} - The bankId or null if not found.
 */
export const resolveBankId = async (accountNumber, ifsc) => {
    const bankApiUrl = process.env.BANK_API_URL || 'http://localhost:5000/api/v1/bank';

    // Primary: look up by account number (most reliable)
    if (accountNumber) {
        try {
            const res = await axios.get(`${bankApiUrl}/account-details/${accountNumber}`, { timeout: 5000 });
            if (res.data?.success && res.data?.account?.bankId) {
                const bankId = res.data.account.bankId?._id || res.data.account.bankId;
                console.log(`[BankHelper] Resolved bankId=${bankId} for account=${accountNumber} via account-details`);
                return bankId;
            }
        } catch (err) {
            console.warn(`[BankHelper] account-details lookup failed for ${accountNumber}: ${err.message}`);
        }
    }

    // Fallback: match by IFSC prefix from bank list
    if (ifsc) {
        try {
            const res = await axios.get(`${bankApiUrl}/list`, { timeout: 5000 });
            if (res.data?.success) {
                const bank = (res.data.banks || []).find(b =>
                    ifsc.toUpperCase().startsWith((b.ifscPrefix || '').toUpperCase())
                );
                if (bank) {
                    console.log(`[BankHelper] Resolved bankId=${bank._id} for IFSC=${ifsc} via bank list`);
                    return bank._id;
                }
            }
        } catch (err) {
            console.warn(`[BankHelper] bank/list lookup failed: ${err.message}`);
        }
    }

    console.error(`[BankHelper] Could not resolve bankId for account=${accountNumber}, ifsc=${ifsc}`);
    return null;
};

// Keep old name as alias for backwards compatibility
export const resolveBankIdFromIfsc = async (ifsc) => resolveBankId(null, ifsc);
