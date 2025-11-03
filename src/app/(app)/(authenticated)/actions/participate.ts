"use server"

import { getPayload } from "payload";
import { getUser } from "./getUser";
import configPromise from '@payload-config';

export async function participate ({ courseId }: {courseId: string}) {
    const payload = await getPayload({ config: configPromise});

    const user = await getUser();

    if (!user) {
        throw new Error("User not found");
    }

    try {
        // Fetch course dengan depth untuk dapat tenant
        const course = await payload.findByID({
            collection: "courses",
            id: courseId,
            depth: 1,
        });

        // Ambil tenantId dari course dengan null check
        let tenantId: string;
        if (!course.tenant) {
            throw new Error("Course does not have a tenant");
        }
        
        if (typeof course.tenant === 'string') {
            tenantId = course.tenant;
        } else {
            tenantId = course.tenant.id;
        }

        // Create participation dengan tenantId yang benar
        const createdParticipation = await payload.create({
            collection: 'participation',
            data: {
                course: courseId,
                customer: user.id,
                tenants: [tenantId],
                tenant: tenantId,
                progress: 0
            },
            overrideAccess: true,
        });

        return createdParticipation;
    } catch (err) {
        console.error(err);
        throw new Error("Error creating participation");
    }
}