"use client";

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import type { ScheduledReview } from '@/types';

export type WindowMode = 'mini' | 'floating' | 'fullscreen';

interface AssessmentContextType {
    isOpen: boolean;
    selectedReview: ScheduledReview | null;
    mode: WindowMode;
    startAssessment: (review: ScheduledReview) => void;
    closeAssessment: () => void;
    setMode: (mode: WindowMode) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

const STORAGE_KEY = 'assessment_session_state';

interface PersistedState {
    isOpen: boolean;
    selectedReview: ScheduledReview | null;
    mode: WindowMode;
}

export const AssessmentSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<ScheduledReview | null>(null);
    const [mode, setMode] = useState<WindowMode>('floating');
    const [isInitialized, setIsInitialized] = useState(false);
    const isClosingRef = useRef(false);

    // Initial load from localStorage
    useEffect(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const { isOpen: savedOpen, selectedReview: savedReview, mode: savedMode } = JSON.parse(savedState) as PersistedState;
                if (savedReview) {
                    setSelectedReview(savedReview);
                    setIsOpen(savedOpen);
                    setMode(savedMode || 'floating');
                }
            }
        } catch (error) {
            console.error('Failed to load assessment session state:', error);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    // Save to localStorage whenever state changes (skip during close sequence)
    useEffect(() => {
        if (!isInitialized || isClosingRef.current) return;

        try {
            const stateToSave: PersistedState = {
                isOpen,
                selectedReview,
                mode
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Failed to save assessment session state:', error);
        }
    }, [isOpen, selectedReview, mode, isInitialized]);

    const startAssessment = (review: ScheduledReview) => {
        isClosingRef.current = false;
        setSelectedReview(review);
        setIsOpen(true);
    };

    const closeAssessment = () => {
        // Set closing flag to prevent the save effect from re-writing state
        isClosingRef.current = true;
        // Clear localStorage immediately before any state changes
        localStorage.removeItem(STORAGE_KEY);
        setIsOpen(false);
        setTimeout(() => {
            setSelectedReview(null);
        }, 300);
    };

    return (
        <AssessmentContext.Provider value={{
            isOpen,
            selectedReview,
            mode,
            startAssessment,
            closeAssessment,
            setMode
        }}>
            {children}
        </AssessmentContext.Provider>
    );
};

export const useAssessment = () => {
    const context = useContext(AssessmentContext);
    if (!context) {
        throw new Error('useAssessment must be used within an AssessmentSessionProvider');
    }
    return context;
};
