CREATE OR REPLACE FUNCTION public.get_active_subscription(_user_id uuid)
 RETURNS TABLE(id uuid, plan sub_plan, source sub_source, started_at timestamp with time zone, expires_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, plan, source, started_at, expires_at FROM public.subscriptions
  WHERE user_id = _user_id
    AND user_id = auth.uid()
    AND status='active'
    AND expires_at > now()
  ORDER BY expires_at DESC LIMIT 1
$function$;