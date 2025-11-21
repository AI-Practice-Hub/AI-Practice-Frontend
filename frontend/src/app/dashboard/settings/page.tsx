"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraApiToken, setJiraApiToken] = useState('');
  const [jiraApiUrl, setJiraApiUrl] = useState('');
  const toast = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await api.get('/user/me');
      setName(response.data.name || '');
      setJiraEmail(response.data.jira_email || '');
      setJiraApiToken(response.data.jira_api_token || '');
      setJiraApiUrl(response.data.jira_api_url || '');
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/user/me', {
        name: name || null,
        jira_email: jiraEmail || null,
        jira_api_token: jiraApiToken || null,
        jira_api_url: jiraApiUrl || null,
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings</p>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Update your personal information and account preferences.
          </p>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              type="text"
              placeholder="Enter your name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Jira Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Jira Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Configure your Jira credentials to enable test case sync and project integration.
          </p>
          <div>
            <Label htmlFor="jira-api-url">Jira API URL</Label>
            <Input 
              id="jira-api-url" 
              type="url"
              placeholder="https://your-domain.atlassian.net" 
              value={jiraApiUrl}
              onChange={(e) => setJiraApiUrl(e.target.value)}
              disabled={saving}
            />
          </div>
          <div>
            <Label htmlFor="jira-email">Jira Email</Label>
            <Input 
              id="jira-email" 
              type="email"
              placeholder="your-email@company.com" 
              value={jiraEmail}
              onChange={(e) => setJiraEmail(e.target.value)}
              disabled={saving}
            />
          </div>
          <div>
            <Label htmlFor="jira-api-token">Jira API Token</Label>
            <Input 
              id="jira-api-token" 
              type="password"
              placeholder="Enter your Jira API token" 
              value={jiraApiToken}
              onChange={(e) => setJiraApiToken(e.target.value)}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Generate your API token from{' '}
              <a 
                href="https://id.atlassian.com/manage-profile/security/api-tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Atlassian Account Settings
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}