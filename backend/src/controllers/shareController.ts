import { Request, Response } from 'express';
import { prisma } from '../db/client';


/**
 * Create an offer to share
 * @param req 
 * @param res 
 * @returns 
 */
export const createSharedOffer = async (req: Request, res: Response) => {
    const { userId, address, offers } = req.body;

    try {
        const share = await prisma.share.create({
            data: {
                userId,
                address,
                offers,
                createdAt: new Date(),
            }
        })

        res.status(201).json(share);

    } catch (error) {
        console.error("[createSharedOffer]", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Get by id an offer that is shared
 * @param req 
 * @param res 
 * @returns 
 */
export const getSharedOffer = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const share = await prisma.share.findUnique({ where: { id } });

        res.status(200).json(share);

    } catch (error) {
        console.error("[getSharedOffer]", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Update by id an offer that is shared
 * @param req 
 * @param res 
 * @returns 
 */
export const updateSharedOffer = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, address, offers } = req.body;

    try {
        const share = await prisma.share.update({ where: { id }, data: { userId, address, offers } });

        res.status(200).json(share);

    } catch (error) {
        console.error("[updateSharedOffer]", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Delete by id an offer that is shared
 * @param req 
 * @param res 
 * @returns 
 */
export const deleteSharedOffer = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const share = await prisma.share.delete({ where: { id } });

        res.status(200).json(share);

    } catch (error) {
        console.error("[deleteSharedOffer]", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Get all offers that are shared
 * @param req 
 * @param res 
 * @returns 
 */
export const getAllSharedOffers = async (req: Request, res: Response) => {
    try {
        const shares = await prisma.share.findMany();

        res.status(200).json(shares);

    } catch (error) {
        console.error("[getAllSharedOffers]", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

