<!-- https://raw.githubusercontent.com/othneildrew/Best-README-Template/refs/heads/main/BLANK_README.md -->

<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![GNU GPLv3][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <!-- <a href="https://github.com/logan-tm/little-tech-ops">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a> -->

<h3 align="center">Little Tech Ops</h3>

  <p align="center">
    A role-based warehouse simulator built to demonstrate modern authentication patterns and permission systems.
    <br />
    <!-- <a href="https://github.com/logan-tm/little-tech-ops"><strong>Explore the docs »</strong></a> -->
    <!-- <br /> -->
    <br />
    <a href="https://github.com/logan-tm/little-tech-ops">View Demo (Coming soon)</a>
    &middot;
    <a href="https://github.com/logan-tm/little-tech-ops/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/logan-tm/little-tech-ops/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

LTO is a full-stack web application that simulates a warehouse operations environment with a complete authentication and authorization system. Visitors to the app can sign in as different warehouse roles—from basic users checking out equipment and completing jobs, to supervisors managing inventory and assignments, managers overseeing vehicles, and admins controlling user access.

The application demonstrates a hierarchical permissions model where each role inherits capabilities from the roles below it. Users can check out equipment and vehicles, accept job assignments, and complete simulated work orders. Supervisors gain the ability to assign jobs and manage inventory. Managers can additionally oversee the vehicle fleet. Admins have full control over user management.

Built as a portfolio piece to demonstrate full-stack development capabilities, the project evolved into a comprehensive exploration of role-based access control (RBAC), session management, and secure authentication patterns. The "warehouse" theme provides an intuitive framework for showcasing how different permission levels interact within a single application.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

[![Tanstack][Tanstack.com]][Tanstack-url]
[![React][React.js]][React-url]
[![tRPC][tRPC.io]][tRPC-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

<!-- This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps. -->

TODO

### Prerequisites

<!-- This is an example of how to list things you need to use the software and how to install them.

- npm
  ```sh
  npm install npm@latest -g
  ``` -->

TODO

### Installation

TODO

<!-- 1. Get a free API Key at [https://example.com](https://example.com)
2. Clone the repo
   ```sh
   git clone https://github.com/logan-tm/little-tech-ops.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your API in `config.js`
   ```js
   const API_KEY = "ENTER YOUR API";
   ```
5. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin logan-tm/little-tech-ops
   git remote -v # confirm the changes
   ``` -->

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

<!-- Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_ -->

TODO

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [x] Implement authentication flow with JWT tokens
- [ ] Implement permissions structure with roles
- [ ] Implement jobs, equipment inventory, and vehicles
- [ ] Implement role-based actions:
  - [ ] Users can checkout equipment, vehicles
  - [ ] Users can "complete" jobs
  - [ ] Supervisors can manage inventory and job assignments
  - [ ] Managers can manage vehicles
  - [ ] Admins can manage users

See the [open issues](https://github.com/logan-tm/little-tech-ops/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the GNU GPLv3. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Logan Michalicek - logan@logantm.com

Project Link: [https://github.com/logan-tm/little-tech-ops](https://github.com/logan-tm/little-tech-ops)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/logan-tm/little-tech-ops.svg?style=for-the-badge
[contributors-url]: https://github.com/logan-tm/little-tech-ops/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/logan-tm/little-tech-ops.svg?style=for-the-badge
[forks-url]: https://github.com/logan-tm/little-tech-ops/network/members
[stars-shield]: https://img.shields.io/github/stars/logan-tm/little-tech-ops.svg?style=for-the-badge
[stars-url]: https://github.com/logan-tm/little-tech-ops/stargazers
[issues-shield]: https://img.shields.io/github/issues/logan-tm/little-tech-ops.svg?style=for-the-badge
[issues-url]: https://github.com/logan-tm/little-tech-ops/issues
[license-shield]: https://img.shields.io/github/license/logan-tm/little-tech-ops.svg?style=for-the-badge
[license-url]: https://github.com/logan-tm/little-tech-ops/blob/main/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png

<!-- Shields.io badges. You can a comprehensive list with many more badges at: https://github.com/inttter/md-badges -->

[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com
[Tanstack.com]: https://img.shields.io/badge/Tanstack-000000?style=for-the-badge&logo=tanstack
[Tanstack-url]: https://tanstack.com
[tRPC.io]: https://img.shields.io/badge/trpc-2596BE?style=for-the-badge&logo=tRPC&logoColor=FFFFFF
[tRPC-url]: https://trpc.io
