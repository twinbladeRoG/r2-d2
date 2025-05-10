import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Card,
  Group,
  Menu,
  NavLink,
  ScrollArea,
  Skeleton,
  Text,
  Title
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useActiveUser } from "../../apis/queries/auth.queries";
import { Icon } from "@iconify/react";
import AppNavLink from "./AppNavLink";
import { useQueryClient } from "@tanstack/react-query";
import { modals } from "@mantine/modals";

const RootLayout = () => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const user = useActiveUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    modals.openConfirmModal({
      title: "Are you sure you want to logout?",
      children: (
        <Text size="sm">
          This action will log you out of your account and you will need to log
          in again to access the application.
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => {},
      onConfirm: () => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        navigate("/");
        queryClient.clear();
      }
    });
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "md",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened }
      }}
      padding={"md"}>
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="md"
            size="md"
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="md"
            size="md"
          />

          <Title>R2 D2</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <AppNavLink
            to="/"
            label="Chat"
            leftSection={<Icon icon="mdi:chat-bubble" />}
          />
          <AppNavLink
            to="/agent"
            label="Agent Chat"
            leftSection={<Icon icon="mdi:face-agent" />}
          />
          <NavLink
            href="#required-for-focus"
            label="Knowledge Base"
            leftSection={<Icon icon="mdi:bookshelf" />}
            childrenOffset={28}
            defaultOpened>
            <AppNavLink
              to="/documents"
              label="Documents"
              leftSection={<Icon icon="mdi:file-document-multiple" />}
            />
          </NavLink>
        </AppShell.Section>

        <AppShell.Section>
          {user.isLoading ? (
            <Skeleton h={100} mt="sm" animate={false} />
          ) : (
            <Card>
              <div className="flex items-center gap-7">
                <Avatar size={"lg"}>
                  {user.data?.first_name?.charAt(0)}
                  {user.data?.last_name?.charAt(0)}
                </Avatar>
                <div className="">
                  <Text>
                    {user.data?.first_name} {user.data?.last_name}
                  </Text>
                  <Text>@{user.data?.username}</Text>
                </div>
                <Menu>
                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <Icon icon="mdi:dots-vertical" className="text-2xl" />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<Icon icon="mdi:user-card-details" />}>
                      Profile
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Icon icon="mdi:logout" />}
                      color="red"
                      onClick={handleLogout}>
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            </Card>
          )}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {user.isError ? <Navigate to="/login" /> : <Outlet />}
      </AppShell.Main>
    </AppShell>
  );
};

export default RootLayout;
