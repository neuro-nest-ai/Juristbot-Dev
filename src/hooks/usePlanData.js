// src/hooks/usePlanData.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import axiosInstance from '../components/config/apiconfig';

export const usePlanData = () => {
  const { user } = useAuth();
  const user_id = user?.id;

  const [planData, setPlanData] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);

  // Main fetch function
  const fetchPlan = useCallback(async () => {
    if (!user_id) {
      setPlanData(null);
      setPlanLoading(false);
      return;
    }

    setPlanLoading(true);
    setPlanData(null);

    try {
      const response = await axiosInstance.get(`/commanprofile/active-plan/${user_id}`);
      setPlanData(response.data);
      
    } catch (error) {
      console.error("Failed to fetch active plan:", error);
      setPlanData(null);
    } finally {
      setPlanLoading(false);
    }
  }, [user_id]);

  // Automatically fetch when user_id changes
  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // Manual refresh function (useful when needed)
  const refreshPlan = useCallback(() => {
    fetchPlan();
  }, [fetchPlan]);

  return {
    planData,
    planLoading,
    refreshPlan
  };
};