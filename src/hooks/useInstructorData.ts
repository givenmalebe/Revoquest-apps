import { useState, useEffect, useCallback } from 'react';
import firebaseApiService from '@/services/firebaseApi';
// Mock data removed - using Firebase data instead

interface UseInstructorDataReturn {
  courses: any[];
  learners: any[];
  currentInstructor: any;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useInstructorData = (userToken: string | undefined): UseInstructorDataReturn => {
  const [state, setState] = useState({
    courses: [],
    learners: [],
    currentInstructor: null,
    loading: true,
    error: null as string | null
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Fetching instructor data...');
      
      if (!userToken) {
        // Use mock data when no token is available
        console.log('No token available, using mock data');
        setState({
          courses: [],
          learners: [],
          currentInstructor: null,
          loading: false,
          error: null
        });
        return;
      }
      
      // Use Promise.allSettled for better error handling
      const [coursesResult, learnersResult, instructorResult] = await Promise.allSettled([
        firebaseApiService.courses.getAll(),
        firebaseApiService.users.getLearners(),
        firebaseApiService.auth.getMe(user?.id || '')
      ]);

      console.log('API Results:', { coursesResult, learnersResult, instructorResult });

      const courses = coursesResult.status === 'fulfilled' && coursesResult.value.success 
        ? coursesResult.value.data.courses || []
        : []; // No fallback data - use Firebase only
      
      const learners = learnersResult.status === 'fulfilled' && learnersResult.value.success
        ? learnersResult.value.data.learners || []
        : []; // No fallback data - use Firebase only
      
      const currentInstructor = instructorResult.status === 'fulfilled' && instructorResult.value.success
        ? instructorResult.value.data
        : null; // No fallback data - use Firebase only

      console.log('Final data:', { courses, learners, currentInstructor });

      setState({
        courses,
        learners,
        currentInstructor,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching instructor data:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load dashboard data. Please try again.',
        loading: false
      }));
    }
  }, [userToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData
  };
};
