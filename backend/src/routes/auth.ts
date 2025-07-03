import { Router, Request, Response } from 'express';
import { sleeperApi } from '../services/sleeperApi';
import { supabase, supabaseAdmin } from '../config/supabase';

const router = Router();

// Connect with Sleeper username
const sleeperConnectHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    // Fetch user from Sleeper API
    const sleeperUser = await sleeperApi.getUser(username);

    if (!sleeperUser) {
      res.status(404).json({ error: 'Sleeper user not found' });
      return;
    }

    // Check if user exists in our database
    const { data: existingUser, error: fetchError } = await (supabaseAdmin || supabase)
      .from('users')
      .select('*')
      .eq('sleeper_user_id', sleeperUser.user_id)
      .single();

    let user;

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      throw fetchError;
    }

    if (!existingUser) {
      // Create new user
      const { data: newUser, error: createError } = await (supabaseAdmin || supabase)
        .from('users')
        .insert({
          sleeper_user_id: sleeperUser.user_id,
          username: sleeperUser.username,
          display_name: sleeperUser.display_name,
          avatar: sleeperUser.avatar
        })
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    } else {
      // Update existing user
      const { data: updatedUser, error: updateError } = await (supabaseAdmin || supabase)
        .from('users')
        .update({
          username: sleeperUser.username,
          display_name: sleeperUser.display_name,
          avatar: sleeperUser.avatar
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) throw updateError;
      user = updatedUser;
    }

    // Create session (in production, use proper JWT tokens)
    // For now, we'll return the user data
    res.json({
      user,
      sleeperUser
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ 
      error: 'Failed to authenticate with Sleeper',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

router.post('/sleeper-connect', sleeperConnectHandler);

// Get current session/user
const sessionHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // In production, verify JWT token here
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      res.status(401).json({ error: 'Invalid session' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
};

router.get('/session', sessionHandler);

// Logout
const logoutHandler = (_req: Request, res: Response): void => {
  // In production, invalidate JWT token here
  res.json({ message: 'Logged out successfully' });
};

router.post('/logout', logoutHandler);

export default router;