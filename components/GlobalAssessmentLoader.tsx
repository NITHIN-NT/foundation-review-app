"use client";

import React, { useSyncExternalStore } from "react";
import { useAssessment } from "@/components/AssessmentSessionProvider";
import { FloatingAssessmentWindow } from "@/components/FloatingAssessmentWindow";

const emptySubscribe = () => () => { };

export const GlobalAssessmentLoader = () => {
    const { isOpen, selectedReview, closeAssessment } = useAssessment();
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

    if (!mounted || (!selectedReview && !isOpen)) return null;

    return (
        <FloatingAssessmentWindow
            review={selectedReview}
            isOpen={isOpen}
            onClose={closeAssessment}
            onComplete={closeAssessment}
        />
    );
};
